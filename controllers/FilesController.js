import { tmpdir } from 'os';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile, stat, existsSync, realpathSync } from 'fs';
import { join as joinPath } from 'path';
import { contentType } from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { getUserFromXToken } from '../utils/auth';

const VALID_FILE_TYPES = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};

const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);
const MAX_FILES_PER_PAGE = 20;
const fileQueue = new Queue('thumbnail generation');

export default class FilesController {
  static async postUpload(req, res) {
    try {
      const { user } = req;
      const { name, type, parentId = ROOT_FOLDER_ID, isPublic = false, data } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !Object.values(VALID_FILE_TYPES).includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (!data && type !== VALID_FILE_TYPES.folder) {
        return res.status(400).json({ error: 'Missing data' });
      }

      const filesCollection = await dbClient.filesCollection();

      if (parentId !== ROOT_FOLDER_ID) {
        const parentFile = await filesCollection.findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== VALID_FILE_TYPES.folder) {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const userId = user._id.toString();
      const baseDir = process.env.FOLDER_PATH ? process.env.FOLDER_PATH : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);
      await mkDirAsync(baseDir, { recursive: true });

      const newFile = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === ROOT_FOLDER_ID ? '0' : new ObjectId(parentId),
      };

      if (type !== VALID_FILE_TYPES.folder) {
        const localPath = joinPath(baseDir, uuidv4());
        await writeFileAsync(localPath, Buffer.from(data, 'base64'));
        newFile.localPath = localPath;
      }

      const insertionInfo = await filesCollection.insertOne(newFile);
      const fileId = insertionInfo.insertedId.toString();

      if (type === VALID_FILE_TYPES.image) {
        fileQueue.add({ userId, fileId });
      }

      return res.status(201).json({ id: fileId, userId, name, type, isPublic, parentId });
    } catch (error) {
      console.error('Error in postUpload:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getShow(req, res) {
    const { user } = req;
    const { id } = req.params;

    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new ObjectId(id), userId: user._id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const { user } = req;
    const { parentId = ROOT_FOLDER_ID.toString(), page = 0 } = req.query;

    const filesCollection = await dbClient.filesCollection();
    const files = await filesCollection.find({ userId: user._id, parentId }).skip(page * MAX_FILES_PER_PAGE).limit(MAX_FILES_PER_PAGE).toArray();

    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const { user } = req;
    const { id } = req.params;

    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new ObjectId(id), userId: user._id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: file._id }, { $set: { isPublic: true } });
    return res.status(200).json({ ...file, isPublic: true });
  }

  static async putUnpublish(req, res) {
    const { user } = req;
    const { id } = req.params;

    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new ObjectId(id), userId: user._id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: file._id }, { $set: { isPublic: false } });
    return res.status(200).json({ ...file, isPublic: false });
  }

  static async getFile(req, res) {
    const { user } = req;
    const { id } = req.params;

    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic && file.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    const filePath = file.localPath;
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).sendFile(realpathSync(filePath));
  }
}

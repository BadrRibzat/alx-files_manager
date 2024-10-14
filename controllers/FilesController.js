import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';
import Queue from 'bull/lib/queue';
import { contentType } from 'mime-types';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from '../utils/db';
import { getUserFromXToken } from '../utils/auth';

const VALID_FILE_TYPES = ['folder', 'file', 'image'];
const ROOT_FOLDER_ID = 0;
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const MAX_FILES_PER_PAGE = 20;

const fileQueue = new Queue('thumbnail generation');

export default class FilesController {
  static async postUpload(req, res) {
    const user = await getUserFromXToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = ROOT_FOLDER_ID, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !VALID_FILE_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    const filesCollection = await dbClient.filesCollection();

    if (parentId !== ROOT_FOLDER_ID) {
      const parentFile = await filesCollection.findOne({ _id: new mongoDBCore.BSON.ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId: parentId === ROOT_FOLDER_ID ? '0' : new mongoDBCore.BSON.ObjectId(parentId),
    };

    if (type !== 'folder') {
      const fileUuid = uuidv4();
      const localPath = join(FOLDER_PATH, fileUuid);
      await fs.writeFile(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    }

    const insertionInfo = await filesCollection.insertOne(newFile);
    const fileId = insertionInfo.insertedId.toString();

    if (type === 'image') {
      fileQueue.add({ userId: user._id.toString(), fileId });
    }

    return res.status(201).json({
      id: fileId,
      userId: user._id.toString(),
      name,
      type,
      isPublic,
      parentId,
    });
  }

  static async getShow(req, res) {
    const user = await getUserFromXToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new mongoDBCore.BSON.ObjectId(id), userId: user._id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const user = await getUserFromXToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = ROOT_FOLDER_ID, page = 0 } = req.query;
    const filesCollection = await dbClient.filesCollection();
    const files = await filesCollection
      .find({ userId: user._id, parentId })
      .skip(parseInt(page, 10) * MAX_FILES_PER_PAGE)
      .limit(MAX_FILES_PER_PAGE)
      .toArray();

    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const user = await getUserFromXToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOneAndUpdate(
      { _id: new mongoDBCore.BSON.ObjectId(id), userId: user._id },
      { $set: { isPublic: true } },
      { returnDocument: 'after' }
    );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file.value);
  }

  static async putUnpublish(req, res) {
    const user = await getUserFromXToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOneAndUpdate(
      { _id: new mongoDBCore.BSON.ObjectId(id), userId: user._id },
      { $set: { isPublic: false } },
      { returnDocument: 'after' }
    );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file.value);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const { size } = req.query;
    const filesCollection = await dbClient.filesCollection();
    const file = await filesCollection.findOne({ _id: new mongoDBCore.BSON.ObjectId(id) });

    if (!file || (!file.isPublic && (!req.user || file.userId.toString() !== req.user._id.toString()))) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    let filePath = file.localPath;
    if (size) {
      filePath = `${filePath}_${size}`;
    }

    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = contentType(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}

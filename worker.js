import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('thumbnail generation');

const generateThumbnail = async (path, size) => {
  const thumbnail = await imageThumbnail(path, { width: size });
  await fs.writeFile(`${path}_${size}`, thumbnail);
};

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const filesCollection = await dbClient.filesCollection();
  const file = await filesCollection.findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  await Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)));
});

export default fileQueue;

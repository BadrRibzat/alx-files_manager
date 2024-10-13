import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './utils/db';
import Mailer from './utils/mailer';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;
  if (!fileId || !userId) {
    throw new Error('Missing fileId or userId');
  }
  const file = await (await dbClient.filesCollection()).findOne({ _id: new mongoDBCore.BSON.ObjectId(fileId), userId: new mongoDBCore.BSON.ObjectId(userId) });
  if (!file) {
    throw new Error('File not found');
  }
  await Promise.all([500, 250, 100].map(size => generateThumbnail(file.localPath, size)));
  done();
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) {
    throw new Error('Missing userId');
  }
  const user = await (await dbClient.usersCollection()).findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  if (!user) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${user.email}!`);
  done();
});

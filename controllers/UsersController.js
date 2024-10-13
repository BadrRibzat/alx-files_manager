import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await (await dbClient.usersCollection()).findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const insertionInfo = await (await dbClient.usersCollection()).insertOne({ email, password: hashedPassword });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    return res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const { user } = req;
    return res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

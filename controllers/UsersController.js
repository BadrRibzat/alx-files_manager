import Queue from 'bull';
import dbClient from '../utils/db';
import { getUserFromXToken } from '../utils/auth';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const userId = await dbClient.createUser(email, password);
    userQueue.add({ userId });

    return res.status(201).json({ id: userId, email });
  }

  static async getMe(req, res) {
    const user = await getUserFromXToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

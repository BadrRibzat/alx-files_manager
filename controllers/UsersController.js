import Queue from 'bull';
import dbClient from '../utils/db';
import { getUserFromXToken } from '../utils/auth';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
<<<<<<< HEAD
    const { email, password } = req.body;
=======
    const { email, password } = req.body; // Directly destructure email and password from req.body
>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

<<<<<<< HEAD
    const userExists = await dbClient.getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const userId = await dbClient.createUser(email, password);
=======
    const usersCollection = await dbClient.usersCollection();
    const user = await usersCollection.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const insertionInfo = await usersCollection.insertOne({ email, password: hashedPassword });
    const userId = insertionInfo.insertedId.toString();

>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a
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

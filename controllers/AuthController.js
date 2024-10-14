import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { getUserFromAuthorization } from '../utils/auth';

class AuthController {
  static async getConnect(req, res) {
    console.log('getConnect called');
    console.log('Authorization header:', req.headers.authorization);
    
    const user = await getUserFromAuthorization(req);
    console.log('User from authorization:', user);

    if (!user) {
      console.log('User not found, returning Unauthorized');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60); // 24 hours expiration
    console.log('Token set in Redis:', token);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    console.log('getDisconnect called');
    const token = req.header('X-Token');
    console.log('X-Token:', token);

    if (!token) {
      console.log('No token provided, returning Unauthorized');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    console.log('UserId from Redis:', userId);

    if (!userId) {
      console.log('No userId found in Redis, returning Unauthorized');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    console.log('Token deleted from Redis');
    return res.status(204).send();
  }
}

export default AuthController;

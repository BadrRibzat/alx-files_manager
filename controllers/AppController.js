import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static async getStatus(req, res) {
    try {
      const redisAlive = await redisClient.isAlive();
      const dbAlive = await dbClient.isAlive();
      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error('Error in getStatus:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req, res) {
    try {
      const [usersCount, filesCount] = await Promise.all([
        dbClient.nbUsers(),
        dbClient.nbFiles(),
      ]);
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

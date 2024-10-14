import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
<<<<<<< HEAD
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
=======
    this.client = createClient({
      host: '127.0.0.1', // Use localhost or 127.0.0.1
      port: 6379, // Use the default Redis port
    });
    this.isClientConnected = false;

    this.client.on('error', (err) => {
      console.error('Redis client error:', err.message || err.toString());
      this.isClientConnected = false;
>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a
    });
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
<<<<<<< HEAD
    return this.client.connected;
=======
    return this.isClientConnected; // Directly check the connection status
>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();
<<<<<<< HEAD
=======

>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a
export default redisClient;

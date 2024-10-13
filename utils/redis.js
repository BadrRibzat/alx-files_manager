import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({
      host: '127.0.0.1', // Use localhost or 127.0.0.1
      port: 6379, // Use the default Redis port
    });
    this.isClientConnected = false;

    this.client.on('error', (err) => {
      console.error('Redis client error:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isClientConnected = true;
    });
  }

  isAlive() {
    return this.isClientConnected; // Directly check the connection status
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    const setexAsync = promisify(this.client.setex).bind(this.client);
    await setexAsync(key, duration, value);
  }

  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;

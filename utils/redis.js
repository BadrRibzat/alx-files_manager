import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
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
    return this.isClientConnected;
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

export default {
  isAlive: redisClient.isAlive.bind(redisClient),
  get: async (key) => {
    await waitForConnection();
    return redisClient.get(key);
  },
  set: async (key, value, duration) => {
    await waitForConnection();
    return redisClient.set(key, value, duration);
  },
  del: async (key) => {
    await waitForConnection();
    return redisClient.del(key);
  },
};

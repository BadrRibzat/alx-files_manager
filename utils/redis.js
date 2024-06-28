// Importing the Redis library and promisify function from the Node.js util module.
const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    // Creating a new Redis client instance and Promisify the client methods
    this.client = redis.createClient();

 
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Handling Redis client errors and Checking the client is connected
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }


  isAlive() {
    return this.client.connected;
  }

  // Async the function to get a value from Redis with promisify expiration key-value time in seconds
  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  // Async the function to delete a key from Redis
  async del(key) {
    this.client.del(key);
  }
}

// Creating an instance of RedisClient and exported to be used in another modules
const redisClient = new RedisClient();

module.exports = redisClient;


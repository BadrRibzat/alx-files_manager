import dbClient from './utils/db';
import redisClient from './utils/redis';

describe('Database and Redis Client Tests', () => {
  before(async () => {
    await dbClient.connect();
    await redisClient.set('test_key', 'test_value', 10);
  });

  after(async () => {
    await dbClient.usersCollection().deleteMany({});
    await redisClient.del('test_key');
  });

  it('should connect to the database', async () => {
    const isAlive = dbClient.isAlive();
    expect(isAlive).to.be.true;
  });

  it('should retrieve a value from Redis', async () => {
    const value = await redisClient.get('test_key');
    expect(value).to.equal('test_value');
  });
});

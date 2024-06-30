import mongodb from 'mongodb';
import envLoader from './env_loader';

class DBClient {
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.db = null;
    this.connectionPromise = null;
  }

  async connect() {
    if (!this.connectionPromise) {
      this.connectionPromise = this.client.connect().then(() => {
        this.db = this.client.db();
        console.log('MongoDB connected successfully');
      }).catch((error) => {
        console.error('MongoDB connection error:', error);
        this.connectionPromise = null;
      });
    }
    return this.connectionPromise;
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    await this.connect();
    try {
      const collection = this.db.collection('users');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  async nbFiles() {
    await this.connect();
    try {
      const collection = this.db.collection('files');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }

  async usersCollection() {
    await this.connect();
    return this.db.collection('users');
  }

  async filesCollection() {
    await this.connect();
    return this.db.collection('files');
  }
}

const dbClient = new DBClient();
export default dbClient;

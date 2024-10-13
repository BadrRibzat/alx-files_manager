// utils/db.js
import mongodb from 'mongodb';
import envLoader from './env_loader';

class DBClient {
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost'; // Update with the existing MongoDB host
    const port = process.env.DB_PORT || 27017; // Update with the existing MongoDB port
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.db = null;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  isAlive() {
    return this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) {
      await this.connect();
    }
    try {
      const collection = this.db.collection('users');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) {
      await this.connect();
    }
    try {
      const collection = this.db.collection('files');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }

  // Using This method to get the users collection
  async usersCollection() {
    if (!this.isAlive()) {
      await this.connect();
    }
    return this.db.collection('users');
  }
}

const dbClient = new DBClient();
export default dbClient;

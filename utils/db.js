import { MongoClient } from 'mongodb';
import sha1 from 'sha1';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        this.db = this.client.db();
        console.log('MongoDB connected successfully');
      }
    });
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async getUserByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  async getUserById(id) {
    const ObjectId = require('mongodb').ObjectId;
    return this.db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  async createUser(email, password) {
    const hashedPassword = this.hashPassword(password);
    const result = await this.db.collection('users').insertOne({ email, password: hashedPassword });
    return result.insertedId.toString();
  }

  hashPassword(password) {
    return sha1(password);
  }
}

const dbClient = new DBClient();
export default dbClient;

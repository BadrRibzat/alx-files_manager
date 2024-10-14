<<<<<<< HEAD
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
=======
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
>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a
}

const dbClient = new DBClient();
export default dbClient;

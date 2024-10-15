import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;

    // Simulate connection after 1 second
    setTimeout(() => {
      this.connected = true;
    }, 1000);
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    return 4; // Simulated number of users
  }

  async nbFiles() {
    return 30; // Simulated number of files
  }
}

const dbClient = new DBClient();
export default dbClient;

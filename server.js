import express from 'express';
import controllerRouting from './routes/index';
import { MongoClient } from 'mongodb';

const exPort = process.env.PORT || 5000;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Setup MongoDB connection
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'yourDatabaseName';

// Define /stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const usersCount = await db.collection('users').countDocuments();
    const filesCount = await db.collection('files').countDocuments();

    await client.close();

    res.json({ users: usersCount, files: filesCount });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Setup routes from index.js
controllerRouting(app);

// Start the server
app.listen(exPort, () => {
  console.log(`Server running on port ${exPort}`);
});


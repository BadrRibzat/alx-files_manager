import express from 'express';
import routes from './routes';
import dbClient from './utils/db';
import redisClient from './utils/redis';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

<<<<<<< HEAD
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('MongoDB connection status:', dbClient.isAlive());
    console.log('Redis connection status:', redisClient.isAlive());
  });
};
=======
app.use(express.json());

injectRoutes(app);
>>>>>>> cba075c176d8539895aa2da4a110edb758d9a03a

const waitForConnections = async () => {
  while (!redisClient.isAlive() || !dbClient.isAlive()) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  startServer();
};

waitForConnections();

export default app;

import express from 'express';
import injectRoutes from './routes/index';
import envLoader from './utils/env_loader';

const app = express();
envLoader();

const PORT = process.env.PORT || 5000;

app.use(express.json());

injectRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

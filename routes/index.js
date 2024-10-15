import express from 'express';
import auth from '../utils/auth';
import { getStatus, getStats } from '../controllers/AppController';
import { postNew, getMe } from '../controllers/UsersController';
import { getConnect, getDisconnect } from '../controllers/AuthController';
import { postUpload } from '../controllers/FilesController';

const router = express.Router();

// returns true if Redis is alive and if the DB is alive too
router.get('/status', getStatus);

// returns the number of users and files in DB
router.get('/stats', getStats);

// UsersController routes create, sign-in, sign-out, authentication system

router.post('/users', postNew);

// retrieves the user based on the existing token
router.get('/users/me', auth, getMe);

// generating a new authentication token for sign-in
router.get('/connect', getConnect);

// sign-out the user
router.get('/disconnect', auth, getDisconnect);

// FilesController routs
router.post('/files', auth, postUpload);

export default router;

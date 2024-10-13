import { Request, Response, NextFunction } from 'express';
import { getUserFromXToken, getUserFromAuthorization } from '../utils/auth';

export const basicAuthenticate = async (req, res, next) => {
  const user = await getUserFromAuthorization(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

export const xTokenAuthenticate = async (req, res, next) => {
  const user = await getUserFromXToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

import redisClient from './redis';
import dbClient from './db';

export const getAuthHeader = (request) => {
  const header = request.headers.authorization;
  console.log('Auth header:', header);
  if (!header) {
    console.log('No auth header found');
    return null;
  }
  return header;
};

export const extractBase64Credentials = (authHeader) => {
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');
  console.log('Extracted credentials:', { email, password: password ? '[REDACTED]' : null });
  return { email, password };
};

export const getUserFromAuthorization = async (req) => {
  console.log('getUserFromAuthorization called');
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    console.log('No auth header, returning null');
    return null;
  }

  const { email, password } = extractBase64Credentials(authHeader);
  if (!email || !password) {
    console.log('Missing email or password, returning null');
    return null;
  }

  const user = await dbClient.getUserByEmail(email);
  console.log('User from database:', user);
  if (!user) {
    console.log('User not found in database');
    return null;
  }

  const hashedPassword = user.password;
  const inputHashedPassword = dbClient.hashPassword(password);
  console.log('Password comparison:', { 
    storedHash: hashedPassword, 
    inputHash: inputHashedPassword,
    match: hashedPassword === inputHashedPassword
  });

  if (hashedPassword !== inputHashedPassword) {
    console.log('Password mismatch');
    return null;
  }

  console.log('User authenticated successfully');
  return user;
};

export const getUserFromXToken = async (req) => {
  console.log('getUserFromXToken called');
  const token = req.header('X-Token');
  console.log('X-Token:', token);
  if (!token) {
    console.log('No X-Token found');
    return null;
  }

  const userId = await redisClient.get(`auth_${token}`);
  console.log('UserId from Redis:', userId);
  if (!userId) {
    console.log('No userId found in Redis');
    return null;
  }

  const user = await dbClient.getUserById(userId);
  console.log('User from database:', user);
  return user;
};

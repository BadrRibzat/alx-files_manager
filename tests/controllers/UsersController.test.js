import dbClient from '../../utils/db';

describe('+ UsersController', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  before(async () => {
    const usersCollection = await dbClient.usersCollection();
    await usersCollection.deleteMany({});
  });

  it('+ Should create a new user', async () => {
    const response = await request.post('/users').send(mockUser);
    expect(response.status).to.equal(201);
    expect(response.body.email).to.equal(mockUser.email);
  });

  it('+ Should fail if user already exists', async () => {
    const response = await request.post('/users').send(mockUser);
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Already exist');
  });

  it('+ Should fail if email is missing', async () => {
    const response = await request.post('/users').send({ password: mockUser.password });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Missing email');
  });

  it('+ Should fail if password is missing', async () => {
    const response = await request.post('/users').send({ email: mockUser.email });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Missing password');
  });

  it('+ Should retrieve user info', async () => {
    const loginResponse = await request.post('/users').send(mockUser);
    const token = loginResponse.body.token;

    const response = await request.get('/users/me').set('X-Token', token);
    expect(response.status).to.equal(200);
    expect(response.body.email).to.equal(mockUser.email);
  });
});

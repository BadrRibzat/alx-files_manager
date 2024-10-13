const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const dbClient = require('../../utils/db');
const redisClient = require('../../utils/redis');

chai.use(chaiHttp);
const { expect } = chai;

describe('AuthController', () => {
  let userId;
  let token;

  before(async () => {
    await dbClient.client.db().collection('users').deleteMany({});
    const res = await chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    userId = res.body.id;
  });

  it('should connect a user and return a token', (done) => {
    chai.request(app)
      .get('/connect')
      .auth('test@example.com', 'password')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        token = res.body.token;
        done();
      });
  });

  it('should disconnect a user', (done) => {
    chai.request(app)
      .get('/disconnect')
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should not disconnect a user with an invalid token', (done) => {
    chai.request(app)
      .get('/disconnect')
      .set('X-Token', 'invalidToken')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Unauthorized');
        done();
      });
  });
});

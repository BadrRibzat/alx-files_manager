const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const dbClient = require('../../utils/db');

chai.use(chaiHttp);
const { expect } = chai;

describe('AppController', () => {
  before(async () => {
    await dbClient.client.db().collection('users').deleteMany({});
    await dbClient.client.db().collection('files').deleteMany({});
  });

  it('should return status', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ redis: true, db: true });
        done();
      });
  });

  it('should return stats', (done) => {
    chai.request(app)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('users');
        expect(res.body).to.have.property('files');
        done();
      });
  });
});

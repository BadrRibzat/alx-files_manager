const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const dbClient = require('../../utils/db');
const redisClient = require('../../utils/redis');
const fs = require('fs');
const path = require('path');

chai.use(chaiHttp);
const { expect } = chai;

describe('FilesController', () => {
  let userId;
  let token;
  let fileId;

  before(async () => {
    await dbClient.client.db().collection('users').deleteMany({});
    await dbClient.client.db().collection('files').deleteMany({});
    const res = await chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    userId = res.body.id;
    const connectRes = await chai.request(app)
      .get('/connect')
      .auth('test@example.com', 'password');
    token = connectRes.body.token;
  });

  it('should upload a file', (done) => {
    const filePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(filePath, 'Hello, World!');
    chai.request(app)
      .post('/files')
      .set('X-Token', token)
      .field('name', 'test.txt')
      .field('type', 'file')
      .attach('data', filePath)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name', 'test.txt');
        fileId = res.body.id;
        done();
      });
  });

  it('should get a file', (done) => {
    chai.request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id', fileId);
        expect(res.body).to.have.property('name', 'test.txt');
        done();
      });
  });

  it('should get files index', (done) => {
    chai.request(app)
      .get('/files')
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.have.property('id', fileId);
        done();
      });
  });

  it('should publish a file', (done) => {
    chai.request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', true);
        done();
      });
  });

  it('should unpublish a file', (done) => {
    chai.request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', false);
        done();
      });
  });

  it('should get file data', (done) => {
    chai.request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('Hello, World!');
        done();
      });
  });
});

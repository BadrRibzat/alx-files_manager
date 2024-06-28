// Import necessary modules
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it } from 'mocha';
import app from '../server';

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('API Endpoint Tests', () => {
  // Test for GET /status endpoint
  describe('GET /status', () => {
    it('it should return 200 and status JSON', (done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Redis and MongoDB are alive');
          done();
        });
    });
  });

  // Test for GET /stats endpoint
  describe('GET /stats', () => {
    it('it should return 200 and stats JSON', (done) => {
      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('users');
          res.body.should.have.property('files');
          done();
        });
    });
  });

  // Test for POST /users endpoint
  describe('POST /users', () => {
    it('it should create a new user', (done) => {
      chai.request(app)
        .post('/users')
        .send({ username: 'testuser', email: 'testuser@example.com' })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('username').eql('testuser');
          res.body.should.have.property('email').eql('testuser@example.com');
          done();
        });
    });
  });
});


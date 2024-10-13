const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const dbClient = require('../../utils/db');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('DBClient', () => {
  it('should be alive', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should count users', async () => {
    const count = await dbClient.nbUsers();
    expect(count).to.be.a('number');
  });

  it('should count files', async () => {
    const count = await dbClient.nbFiles();
    expect(count).to.be.a('number');
  });
});

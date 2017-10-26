
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Accounts', () => {

  describe('/GET account', () => {
    it('it should GET account with a given address on mainnet', (done) => {
        chai.request(server).
            get('/mainnet/account/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv').
            end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.equal(true);
                res.body.account.address.should.be.equal("AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv");
              done();
            });
      });

    it('it should GET account with a given address on devnet', (done) => {
        chai.request(server).
            get('/devnet/account/DGihocTkwDygiFvmg6aG8jThYTic47GzU9').
            end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.equal(true);
                res.body.account.address.should.be.equal("DGihocTkwDygiFvmg6aG8jThYTic47GzU9");
              done();
            });
      });
  });

  describe('/POST account', () => {
    it('it should create an account on mainnet', (done) => {
      chai.request(server).
        post('/mainnet/account').
        send({passphrase: "this is a test"}).
        end((err, res) => {
            res.should.have.status(200);
            res.body.success.should.be.equal(true);
            res.body.account.address.should.be.equal("AUdAwTiByRp5BFyGz9uxXuNYa1KGHT4rmt");
            res.body.account.publicKey.should.be.equal("03675c61dcc23eab75f9948c6510b54d34fced4a73d3c9f2132c76a29750e7a614");
        done();
        });
    });

    it('it should create an account on devnet', (done) => {
        chai.request(server).
            post('/devnet/account').
            send({passphrase: "this is a test"}).
            end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.equal(true);
                res.body.account.address.should.be.equal("DHzPqDoCwh4CuHwtA6FBvnH3yY7sJmZ54P");
                res.body.account.publicKey.should.be.equal("03675c61dcc23eab75f9948c6510b54d34fced4a73d3c9f2132c76a29750e7a614");
              done();
            });
        });
    });

});
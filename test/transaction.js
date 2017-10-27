
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const arkjs = require('arkjs');
const should = chai.should();

chai.use(chaiHttp);

describe('Transactions', () => {

  describe('/GET transaction', () => {
    it('it should GET last account transactions on mainnet', (done) => {
      chai.request(server).
        get('/mainnet/transactions/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv').
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          res.body.count.should.be.above(3);
          res.body.transactions.length.should.be.above(3);
          done();
        });
    });

    it('it should GET last account transactions on devnet', (done) => {
      chai.request(server).
        get('/devnet/transactions/DGihocTkwDygiFvmg6aG8jThYTic47GzU9').
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          res.body.count.should.be.above(30);
          res.body.transactions.length.should.be.above(30);
          done();
        });
    });

  });

  describe('/POST transaction', () => {
    let mainnettx;
    it('it should create tx on mainnet and tx should verify', (done) => {
      chai.request(server).
        post('/mainnet/transaction').
        send({
          amount: 100000000,
          recipientId: "AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv",
          passphrase: "This is a test"
        }).
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          res.body.transaction.recipientId.should.equal("AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv");
          mainnettx = res.body.transaction;
          arkjs.crypto.verify(mainnettx).should.be.equal(true);
          done();
        });
    });

    it('it should broadcast tx on mainnet', (done) => {
      chai.request(server).
        post('/mainnet/broadcast').
        send(mainnettx).
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          done();
        });
    });

    let devnettx;
    it('it should create tx on devnet and tx should verify', (done) => {
      chai.request(server).
        post('/devnet/transaction').
        send({
          amount: 100000000,
          recipientId: "DGihocTkwDygiFvmg6aG8jThYTic47GzU9",
          passphrase: "This is a test"
        }).
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          res.body.transaction.recipientId.should.equal("DGihocTkwDygiFvmg6aG8jThYTic47GzU9");
          devnettx = res.body.transaction;
          arkjs.crypto.verify(devnettx).should.be.equal(true);
          done();
        });
    });

    it('it should broadcast tx on devnet', (done) => {
      chai.request(server).
        post('/devnet/broadcast').
        send(devnettx).
        end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.equal(true);
          done();
        });
    });


  });

});
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const arkjs = require('arkjs')
const bip39 = require('bip39')

chai.should()
chai.use(chaiHttp)

describe('Accounts', () => {
  describe('/GET account', () => {
    it('it should GET account with a given address on mainnet', (done) => {
      chai.request(server)
      .get('/mainnet/account/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.account.address.should.be.equal('AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
        done()
      })
    })

    it('it should GET account with a given address on devnet', (done) => {
      chai.request(server)
      .get('/devnet/account/DGihocTkwDygiFvmg6aG8jThYTic47GzU9')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.account.address.should.be.equal('DGihocTkwDygiFvmg6aG8jThYTic47GzU9')
        done()
      })
    })

    // it('STRESSTEST: it should GET 50000 accounts on devnet', (done) => {
    //   for(let i = 0; i < 50000; i++){
    //     const address = arkjs.crypto.getKeys(bip39.generateMnemonic()).getAddress()
    //     chai.request(server).
    //     get('/devnet/account/'+address).
    //     end((err, res) => {
    //       res.should.have.status(200)
    //       res.body.success.should.be.equal(true)
    //       res.body.account.address.should.be.equal(address)
    //       done()
    //     })
    //   }

    // })
  })

  describe('/POST account', () => {
    it('it should create an account on mainnet', (done) => {
      chai.request(server)
      .post('/mainnet/account')
      .send({
        passphrase: 'this is a test'
      })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.account.address.should.be.equal('AUdAwTiByRp5BFyGz9uxXuNYa1KGHT4rmt')
        res.body.account.publicKey.should.be.equal('03675c61dcc23eab75f9948c6510b54d34fced4a73d3c9f2132c76a29750e7a614')
        done()
      })
    })

    var bip38address = null
    var bip38backup = null
    var userid = require('crypto').randomBytes(32).toString('hex')

    it('it should create an account on mainnet using bip38 encryption', (done) => {
      chai.request(server)
      .post('/mainnet/account/bip38')
      .send({
        bip38: 'master password',
        userid
      })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.should.have.property('address')
        res.body.should.have.property('wif')
        bip38address = res.body.address
        bip38backup = res.body.wif
        done()
      })
    })

    it('it should find bip38 backup from userid', (done) => {
      chai.request(server)
      .get(`/mainnet/account/bip38/${userid}`)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.should.have.property('wif')
        bip38backup = res.body.wif.should.equal(bip38backup)
        done()
      })
    })

    it('it should create transaction from bip38 backup using userid', (done) => {
      chai.request(server)
      .post('/mainnet/transaction/bip38')
      .send({
        bip38: 'master password',
        userid,
        amount: 1000000000,
        recipientId: 'AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv'
      })
      .end((err, res) => {
        process.stdout.write('.')
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.transaction.recipientId.should.equal('AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
        arkjs.crypto.verify(res.body.transaction).should.be.equal(true)
        done()
      })
    })

    it('it should create an account on devnet', (done) => {
      chai.request(server)
      .post('/devnet/account')
      .send({
        passphrase: 'this is a test'
      })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.success.should.be.equal(true)
        res.body.account.address.should.be.equal('DHzPqDoCwh4CuHwtA6FBvnH3yY7sJmZ54P')
        res.body.account.publicKey.should.be.equal('03675c61dcc23eab75f9948c6510b54d34fced4a73d3c9f2132c76a29750e7a614')
        done()
      })
    })
  })
})

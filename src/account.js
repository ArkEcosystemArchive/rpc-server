var arkjs = require('arkjs');
var bip39 = require('bip39');
var bip38 = require('bip38');
var BigInteger = require('bigi');
var network = require('./network');
var leveldb = require('./leveldb');

function get (req, res, next) {
  network.getFromNode(`/api/accounts?address=${req.params.address}`, function (err, response, body) {
    if (err) next();
    else {
      body = JSON.parse(body);
      res.send(body);
      next();
    }
  });
}

function getTransactions (req, res, next) {
  const offset = req.query.offset || 0;
  network.getFromNode(`/api/transactions?offset=${offset}&orderBy=timestamp:desc&senderId=${req.params.address}&recipientId=${req.params.address}`, function (err, response, body) {
    if (err) next();
    else {
      body = JSON.parse(body);
      res.send(body);
      next();
    }
  });
}

function getBip38Account (req, res, next) {
  leveldb
    .getUTF8(arkjs.crypto.sha256(Buffer.from(req.params.userid)).toString('hex'))
    .then(function (wif) {
      res.send({
        success: true,
        wif
      });
      next();
    })
    .catch(function (err) {
      res.send({
        success: false,
        err
      });
      next();
    });
}

function getBip38Keys (userid, bip38password) {
  return leveldb
    .getUTF8(arkjs.crypto.sha256(Buffer.from(userid)).toString('hex'))
    .then(function (wif) {
      if (wif) {
        var decrypted = bip38.decrypt(wif.toString('hex'), bip38password + userid);
        var keys = new arkjs.ECPair(BigInteger.fromBuffer(decrypted.privateKey), null);

        return Promise.resolve({
          keys,
          wif
        });
      }

      return Promise.reject(new Error('Could not founf WIF'));
    });
}

function createBip38 (req, res, next) {
  var keys = null;
  if (req.params.bip38 && req.params.userid) {
    getBip38Keys(req.params.userid, req.params.bip38)
      .catch(function () {
        keys = arkjs.crypto.getKeys(bip39.generateMnemonic());
        var encryptedWif = bip38.encrypt(keys.d.toBuffer(32), true, req.params.bip38 + req.params.userid);
        leveldb.setUTF8(arkjs.crypto.sha256(Buffer.from(req.params.userid)).toString('hex'), encryptedWif);

        return Promise.resolve({
          keys,
          wif: encryptedWif
        });
      })
      .then(function (account) {
        res.send({
          success: true,
          publicKey: account.keys.getPublicKeyBuffer().toString('hex'),
          address: account.keys.getAddress(),
          wif: account.wif
        });
        next();
      })
      .catch(function (err) {
        if (err) {
          res.send({
            success: false,
            err
          });
        }
        next();
      });
  } else {
    res.send({
      success: false,
      err: 'Wrong parameters'
    });
    next();
  }
}

function create (req, res, next) {
  var account = null;
  if (req.params.passphrase) {
    account = arkjs.crypto.getKeys(req.params.passphrase);
    res.send({
      success: true,
      account: {
        publicKey: account.publicKey,
        address: arkjs.crypto.getAddress(account.publicKey)
      }
    });
    next();
  } else {
    res.send({
      success: false,
      err: 'Wrong parameters'
    });
    next();
  }
}

module.exports = {
  get,
  getBip38Account,
  getBip38Keys,
  getTransactions,
  create,
  createBip38
};

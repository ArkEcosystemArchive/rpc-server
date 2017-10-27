var arkjs = require('arkjs');
var bip39 = require('bip39');
var bip38 = require('bip38');
var BigInteger = require('bigi')
var network = require('./network');
var leveldb = require('./leveldb');

function get(req, res, next) {
  network.getFromNode(`/api/accounts?address=${req.params.address}`, function (err, response, body) {
    if(err) next();
    else {
      body = JSON.parse(body);
      res.send(body);
      next();
    }
  });
}

function getTransactions(req, res, next) {
  network.getFromNode(`/api/transactions?orderBy=timestamp:desc&senderId=${req.params.address}&recipientId=${req.params.address}`, function(err, response, body) {
    if(err) next();
    else {
      body = JSON.parse(body);
      res.send(body);
      next();
    }
  });
}

function getBip38Account(req, res, next){
  leveldb.
    getUTF8(arkjs.crypto.sha256(Buffer.from(req.params.userid)).toString('hex')).
    then(function(wif){
      res.send({
        success: true,
        wif
      });
      next();
    }).
    catch(function (err) {
      res.send({
        success: false,
        err
      });
      next();
    });
}

function getBip38Keys(userid, bip38password, callback){
  leveldb.
    getUTF8(arkjs.crypto.sha256(Buffer.from(userid)).toString('hex')).
    then(function(wif){
      if(wif){
        var decrypted = bip38.decrypt(wif.toString('hex'), bip38password);
        var keys = new arkjs.ECPair(BigInteger.fromBuffer(decrypted.privateKey), null);
        callback(null, keys);
      } else {
        callback("WIF not found");
      }
    }).
    catch(function (err) {
      callback(err);
    });
}

function create(req, res, next) {
  var account = null;
  if(req.params.passphrase){
    account = arkjs.crypto.getKeys(req.params.passphrase);
    res.send({
      success: true,
      account: {
        publicKey: account.publicKey,
        address: arkjs.crypto.getAddress(account.publicKey)
      }
    });
    next();
  } else if(req.params.bip38){
    account = arkjs.crypto.getKeys(bip39.generateMnemonic());
    var encryptedWif = bip38.encrypt(account.d.toBuffer(32), true, req.params.bip38);
    leveldb.
      setUTF8(arkjs.crypto.sha256(Buffer.from(req.params.userid)).toString("hex"), encryptedWif).
      then(function(){
        res.send({
          success: true,
          account: {
            backup: {wif: encryptedWif},
            address: arkjs.crypto.getAddress(account.publicKey)
          }
        });
        next();
      }).
      catch(function (err) {
        if(err){
          res.send({
            success: false,
            err
          });
        }
        next();
      });
  }
}

module.exports = {
  get,
  getBip38Account,
  getBip38Keys,
  getTransactions,
  create
};
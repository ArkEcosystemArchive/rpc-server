var arkjs = require('arkjs');
var account = require('./account');
var network = require('./network');
var leveldb = require('./leveldb');

function get(req, res, next) {
  network.getFromNode(`/api/transactions/get?id=${req.params.id}`, function (err, response, body) {
    if(err) next();
    else {
      body = JSON.parse(body);
      res.send(body);
      next();
    }
  });
}

function createBip38(req, res, next) {
  account.getBip38Keys(req.params.userid, req.params.bip38).
    then(function(acc){
      var transaction = arkjs.transaction.createTransaction(req.params.recipientId, req.params.amount, null, "dummy");
      transaction.senderPublicKey = acc.keys.getPublicKeyBuffer().toString("hex");
      delete transaction.signature;
      arkjs.crypto.sign(transaction, acc.keys);
      transaction.id = arkjs.crypto.getId(transaction);
      leveldb.
        setObject(transaction.id, transaction).
        then(function(){
          res.send({
            success: true,
            transaction
          });
          next();
        }).
        catch(function(err){
          res.send({
            success: false,
            err
          });
          next();
        });
    }).
    catch(function(err){
      res.send({
        success: false,
        err
      });
      next();
    });
}

function create(req, res, next) {
  var amount = parseInt(req.params.amount);
  var transaction = arkjs.transaction.createTransaction(req.params.recipientId, amount, null, req.params.passphrase);
  leveldb.
    setObject(transaction.id, transaction).
    then(function(){
      res.send({
        success: true,
        transaction
      });
      next();
    }).
    catch(function(err){
      res.send({
        success: false,
        err
      });
      next();
    });
}

function getAll(req, res, next) {
  // Avar tx = db.get('transactions');
  next();
}

function broadcast(req, res, next) {
  if(req.params.transactions){ //old way
    Promise.all(
      req.params.transactions.map((transaction) => 
        network.broadcast(transaction, function () {
          return Promise.resolve(transaction);
        })
      )
    ).then((transactions) => {
      res.send({
        success: true,
        transactionIds: req.params.transactions.map((tx) => tx.id)
      });
      next();
    });
  } else leveldb.getObject(req.params.id).
    then(function(transaction){
      transaction = transaction || req.params;
      if (!arkjs.crypto.verify(transaction)) {
        res.send({
          success: false,
          error: "transaction does not verify",
          transaction
        });
        next();
      }
      network.broadcast(transaction, function () {
        res.send({
          success: true,
          transaction
        });
        next();
      });
    }).
    catch(function(err){
      res.send({
        success: false,
        err
      });
      next();
    });
}

module.exports = {
  create,
  createBip38,
  get,
  broadcast,
  getAll
};
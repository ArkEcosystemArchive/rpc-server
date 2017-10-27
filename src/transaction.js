var arkjs = require('arkjs');
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

function create(req, res, next) {
  var transaction = arkjs.transaction.createTransaction(req.params.recipientId, req.params.amount, null, req.params.passphrase);
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
  leveldb.getObject(req.params.id).
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
  get,
  broadcast,
  getAll
};
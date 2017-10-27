var arkjs = require('arkjs');
var network = require('./network');
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');

var adapter = new FileSync(`${__dirname}/../storage.lowdb`);
var db = low(adapter);
db.defaults({transactions: []}).
  write();

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
  var tx = arkjs.transaction.createTransaction(req.params.recipientId, req.params.amount, null, req.params.passphrase);
  db.get('transactions').
    push(tx).
    write();
  res.send(tx);
  next();
}

function getAll(req, res, next) {
  // Avar tx = db.get('transactions');
  next();
}

function broadcast(req, res, next) {
  var tx = db.get('transactions').
    find({id: req.params.id}).
    value() || req.params;
  if (!arkjs.crypto.verify(tx)) {
    res.send({
      success: false,
      error: "transaction does not verify",
      transaction: tx
    });
    next();
  }
  network.broadcast(tx, function () {
    res.send({success: true});
    next();
  });
}

module.exports = {
  create,
  get,
  broadcast,
  getAll
};
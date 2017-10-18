var arkjs = require('arkjs');
var network = require('./network');
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');

var adapter = new FileSync('storage.lowdb')
var db = low(adapter);
db.defaults({ transactions: [] })
  .write()

function get(req, res, next) {
  network.getFromNode('/api/transactions/get?id=' + req.params.id, function (err, response, body) {
    body = JSON.parse(body);
    res.send(body);
    next();
  });
}

function create(req, res, next) {
  const tx = arkjs.transaction.createTransaction(req.params.recipientId, req.params.amount, null, req.params.passphrase);
  db.get('transactions')
    .push(tx)
    .write()
  res.send(tx);
}

function getAll(req, res, next) {
  var tx = db.get('transactions');
}

function broadcast(req, res, next) {
  var tx = db.get('transactions')
    .find({ id: req.params.id })
    .value() || req.params;
  if (!arkjs.crypto.verify(tx)) {
    res.send({ success: false, error: "transaction does not verify", transaction: tx });
    return next();
  }
  network.broadcast(tx, function () {
    res.send({ success: true });
    next();
  });
}

module.exports = {
  create: create,
  get: get,
  broadcast: broadcast,
  getAll: getAll
};
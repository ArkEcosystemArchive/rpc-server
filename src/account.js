var arkjs = require('arkjs');
var network = require('./network');

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

function create(req, res, next) {
  var account = arkjs.crypto.getKeys(req.params.passphrase);
  res.send({
    success: true,
    account: {
      publicKey: account.publicKey,
      address: arkjs.crypto.getAddress(account.publicKey)
    }
  });
  next();
}

module.exports = {
  get,
  getTransactions,
  create
};
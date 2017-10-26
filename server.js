var restify = require('restify');

var account = require('./src/account');
var transaction = require('./src/transaction');
var network = require('./src/network');

function restrictToLocalhost(req, res, next){
  if(req.connection.remoteAddress == "::1" || req.connection.remoteAddress == "127.0.0.1" || req.connection.remoteAddress == "::ffff:127.0.0.1")
    next();
  else res.end();
}

var server = restify.createServer();
server.use(restify.plugins.bodyParser({mapParams: true}));
server.use(network.connect);
server.use(restrictToLocalhost);


server.get('/:network/account/:address', account.get);
server.post('/:network/account', account.create);
server.get('/:network/transactions/:address', account.getTransactions);

server.post('/:network/transaction', transaction.create);

server.post('/:network/broadcast', transaction.broadcast);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

module.exports = server;
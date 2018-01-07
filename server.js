#! /usr/bin/env forever

var restify = require('restify');
var account = require('./src/account');
var transaction = require('./src/transaction');
var network = require('./src/network');
var program = require('commander');

var server = null;

function restrictToLocalhost(req, res, next){
  if(program.allowRemote) next();
  else
    if(req.getRoute().path == '/:network/broadcast' || req.connection.remoteAddress == "::1" || req.connection.remoteAddress == "127.0.0.1" || req.connection.remoteAddress == "::ffff:127.0.0.1")
      next();
    else res.end();
}

function startServer(port){
  if (program.allowRemote) console.log('Warning! ark-rpc allows remote connections, this is potentially insecure!');

  server = restify.createServer().
    use(restrictToLocalhost).
    use(restify.plugins.bodyParser({mapParams: true})).
    use(restify.plugins.queryParser({mapParams: true})).
    use(network.connect);

    server.get('/:network/account/bip38/:userid', account.getBip38Account);
    server.get('/:network/account/:address', account.get);
    server.post('/:network/account/bip38', account.createBip38);
    server.post('/:network/account', account.create);
    server.get('/:network/transactions/:address', account.getTransactions);
    server.post('/:network/transaction/bip38', transaction.createBip38);
    server.post('/:network/transaction', transaction.create);
    server.post('/:network/broadcast', transaction.broadcast);

    server.listen(port, function() {
      console.log('ark-rpc listening at %s', server.url);
    });
}

program.
  option('-p, --port <port>', 'The port to start server').
  option('--allow-remote', 'Allow connections from sources other than localhost').
  parse(process.argv);

if(program.port)
  startServer(program.port);
else
  startServer(8080);

// For testing purpose
module.exports = server;
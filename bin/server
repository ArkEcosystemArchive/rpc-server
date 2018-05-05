#! /usr/bin/env forever

var restify = require('restify');
var account = require('./src/account');
var transaction = require('./src/transaction');
var network = require('./src/network');
var program = require('commander');

const allowedRemotes = [
  "::1",
  "127.0.0.1",
  "::ffff:127.0.0.1"
];

var server = null;

function restrictHost(req, res, next){
  var remote = req.connection.remoteAddress;
  if (remote.startsWith("::ffff:")) remote = remote.replace("::ffff:", "");
  if(program.allowRemote) return next();
  else
    if(req.getRoute().path == '/:network/broadcast') return next();
    else
      if(program.allow.includes(remote)) return next();
      else
        for(let item of program.allow) {
          let mask = item.split(/[\:\.]/);
          let address = remote.split(/[\:\.]/);
          let ok = true;
          for (let i = 0; i < mask.length; i++)
            if (mask[i] === "*") continue;
            else
              if (mask[i] !== address[i]) { ok = false; break; }
              else continue;
          if (ok) return next();
        };
  res.end();
}

function startServer(port){
  if (program.allowRemote) console.log('Warning! ark-rpc allows remote connections, this is potentially insecure!');

  server = restify.createServer().
    use(restrictHost).
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
  option('--allow-remote', 'Allow all connections from sources other than localhost').
  option('--allow <address>', 'Add addresses to the whitelist. Allows usage of * for placeholder in addresses, eg. 192.168.178.* or 10.0.*.*.', (val, memo) => {
    memo.push(val);
    return memo;
  }, allowedRemotes).
  parse(process.argv);

if(program.port)
  startServer(program.port);
else
  startServer(8080);

// For testing purpose
module.exports = server;
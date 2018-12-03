var nurl = require('url');
var request = require('request');
var async = require('async');
var arkjs = require('arkjs');

var network = null,
  server = null;

var networks = {
  devnet: {
    name: "devnet",
    nethash: "578e820911f24e039733b45e4882b73e301f813a0d2c31330dafda84534ffa23",
    slip44: 1,
    version: 30,
    peers: [
      "167.114.29.52:4002",
      "167.114.29.53:4002",
      "167.114.29.54:4002",
      "167.114.29.55:4002"
    ]
  },
  mainnet: {
    name: "mainnet",
    slip44: 111,
    nethash: "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988",
    version: 23,
    peers: [
      '5.196.105.32:4001',
      '5.196.105.33:4001',
      '5.196.105.34:4001',
      '5.196.105.35:4001',
      '5.196.105.36:4001',
      '5.196.105.37:4001',
      '5.196.105.38:4001',
      '5.196.105.39:4001',
      '178.32.65.136:4001',
      '178.32.65.137:4001',
      '178.32.65.138:4001',
      '178.32.65.139:4001',
      '178.32.65.140:4001',
      '178.32.65.141:4001',
      '178.32.65.142:4001',
      '178.32.65.143:4001',
      '5.196.105.40:4001',
      '5.196.105.41:4001',
      '5.196.105.42:4001',
      '5.196.105.43:4001',
      '5.196.105.44:4001',
      '5.196.105.45:4001',
      '5.196.105.46:4001',
      '5.196.105.47:4001',
      '54.38.120.32:4001',
      '54.38.120.33:4001',
      '54.38.120.34:4001',
      '54.38.120.35:4001',
      '54.38.120.36:4001',
      '54.38.120.37:4001',
      '54.38.120.38:4001',
      '54.38.120.39:4001',
      '151.80.125.32:4001',
      '151.80.125.33:4001',
      '151.80.125.34:4001',
      '151.80.125.35:4001',
      '151.80.125.36:4001',
      '151.80.125.37:4001',
      '151.80.125.38:4001',
      '151.80.125.39:4001',
      '213.32.41.104:4001',
      '213.32.41.105:4001',
      '213.32.41.106:4001',
      '213.32.41.107:4001',
      '213.32.41.108:4001',
      '213.32.41.109:4001',
      '213.32.41.110:4001',
      '213.32.41.111:4001',
      '5.135.22.92:4001',
      '5.135.22.93:4001',
      '5.135.22.94:4001',
      '5.135.22.95:4001',
      '5.135.52.96:4001',
      '5.135.52.97:4001',
      '5.135.52.98:4001',
      '5.135.52.99:4001',
      '51.255.105.52:4001',
      '51.255.105.53:4001',
      '51.255.105.54:4001',
      '51.255.105.55:4001',
      '46.105.160.104:4001',
      '46.105.160.105:4001',
      '46.105.160.106:4001',
      '46.105.160.107:4001',
    ]
  }
};

function getFromNode(url, cb) {
  var nethash = network ? network.nethash : "";

  if (!url.startsWith("http")) {
    url = `http://${server}${url}`;
  }

  if (url.includes("/api/")) {
    url = url.replace(nurl.parse(url).port, 4003)
  }

  request(
    {
      url,
      headers: {
        nethash,
        version: '2.0.0',
        port: 1
      },
      timeout: 5000
    },
    function(error, response, body){
      if(error){
        server = network.peers[Math.floor(Math.random() * 1000) % network.peers.length];
      }
      cb(error, response, body);
    }
  );
}

function findEnabledPeers(cb) {
  var peers = [];
  getFromNode('/peer/list', function (err, response, body) {
    if (err || body == undefined) {
      cb(peers);
    }
    var respeers = JSON.parse(body).peers.
    filter(function (peer) {
      return peer.status == "OK";
    }).
    map(function (peer) {
      return `${peer.ip}:${peer.port}`;
    });
    async.each(respeers, function (peer, eachcb) {
      getFromNode(`http://${peer}/api/blocks/getHeight`, function (error, res, body2) {
        if (!error && body2 != "Forbidden") {
          peers.push(peer);
        }
        eachcb();
      });
    }, function (error) {
      if (error) return cb(error);

      return cb(peers);
    });

  });
}

function postTransaction(transaction, cb) {
  request(
    {
      url: `http://${server}/peer/transactions`,
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port: 1
      },
      method: 'POST',
      json: true,
      body: {transactions: [transaction]}
    },
    cb
  );
}

function broadcast(transaction, callback) {
  network.peers.slice(0, 10).forEach(function (peer) {
    // Console.log("sending to", peer);
    request({
      url: `http://${peer}/peer/transactions`,
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port: 1
      },
      method: 'POST',
      json: true,
      body: {transactions: [transaction]}
    });
  });
  callback();
}


function connect2network(netw, callback) {
  network = netw;
  server = netw.peers[Math.floor(Math.random() * 1000) % netw.peers.length];
  findEnabledPeers(function (peers) {
    if (peers.length > 0) {
      [server] = peers;
      netw.peers = peers;
    }
    callback();
  });
  getFromNode('/api/loader/autoconfigure', function (err, response, body) {
    if (err) return;
    if (!body || !body.startsWith("{"))
      connect2network(netw, callback);
    else {
      netw.config = JSON.parse(body).network;
    }
  });
}

function connect(req, res, next) {
  if (!server || !network || network.name != req.params.network) {
    if (networks[req.params.network]) {
      arkjs.crypto.setNetworkVersion(networks[req.params.network].version);
      connect2network(networks[req.params.network], next);
    } else {
      res.send({
        success: false,
        error: `Could not find network ${req.params.network}`
      });
      res.end();
    }
  } else {
    next();
  }
}


module.exports = {
  broadcast,
  connect,
  getFromNode,
  postTransaction
};

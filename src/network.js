var request = require('request');
var async = require('async');
var arkjs = require('arkjs');
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('storage.lowdb');
var db = low(adapter);

var server, network;

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
      "5.39.9.240:4001",
      "5.39.9.241:4001",
      "5.39.9.242:4001",
      "5.39.9.243:4001",
      "5.39.9.244:4001",
      "5.39.9.250:4001",
      "5.39.9.251:4001",
      "5.39.9.252:4001",
      "5.39.9.253:4001",
      "5.39.9.254:4001",
      "5.39.9.255:4001",
      "193.70.72.90:4001"
    ]
  }
};

function findEnabledPeers(cb) {
  var peers = [];
  getFromNode('/peer/list', function (err, response, body) {
    if (err) {
      return cb(peers);
    }
    else {
      var respeers = JSON.parse(body).peers
        .filter(function (peer) {
          return peer.status == "OK";
        })
        .map(function (peer) {
          return peer.ip + ":" + peer.port;
        });
      async.each(respeers, function (peer, cb) {
        getFromNode('http://' + peer + '/api/blocks/getHeight', function (err, response, body) {
          if (body != "Forbidden") {
            peers.push(peer);
          }
          cb();
        });
      }, function (err) {
        return cb(peers);
      });
    }
  });
}

function postTransaction(transaction, cb) {
  request(
    {
      url: 'http://' + server + '/peer/transactions',
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port: 1
      },
      method: 'POST',
      json: true,
      body: { transactions: [transaction] }
    },
    cb
  );
}

function broadcast(transaction, callback) {
  network.peers.slice(0, 10).forEach(function (peer) {
    //console.log("sending to", peer);
    request(
      {
        url: 'http://' + peer + '/peer/transactions',
        headers: {
          nethash: network.nethash,
          version: '1.0.0',
          port: 1
        },
        method: 'POST',
        json: true,
        body: { transactions: [transaction] }
      }
    );
  });
  callback();
}

function getFromNode(url, cb) {
  nethash = network ? network.nethash : "";
  if (!url.startsWith("http")) {
    url = 'http://' + server + url;
  }
  request(
    {
      url: url,
      headers: {
        nethash: nethash,
        version: '1.0.0',
        port: 1
      },
      timeout: 2000
    },
    cb
  );
}



function connect2network(n, callback) {
  network = n;
  server = n.peers[Math.floor(Math.random() * 1000) % n.peers.length];
  findEnabledPeers(function (peers) {
    if (peers.length > 0) {
      server = peers[0];
      n.peers = peers;
    }
  });
  getFromNode('/api/loader/autoconfigure', function (err, response, body) {
    if (!body || !body.startsWith("{")) connect2network(n, callback);
    else {
      n.config = JSON.parse(body).network;
      callback();
    }
  });
}

function connect(req, res, next) {
  if (!server || !network || network.name != req.params.network) {
    arkjs.crypto.setNetworkVersion(networks[req.params.network].version);
    connect2network(networks[req.params.network], next);
  }
  else {
    next();
  }
}



module.exports = {
  connect: connect,
  getFromNode: getFromNode,
  broadcast: broadcast,
  postTransaction: postTransaction
}
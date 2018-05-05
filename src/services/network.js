const request = require('request')
const async = require('async')
const arkjs = require('arkjs')
const networks = require('./networks')

class Network {
  setNetwork (network) {
    this.network = network
  }

  setServer (server) {
    this.server = server
  }

  getFromNode (url, cb) {
    const nethash = this.network ? this.network.nethash : ''

    if (!url.startsWith('http')) {
      url = `http://${this.server}${url}`
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
      function (error, response, body) {
        if (error) {
          this.server = this.network.peers[Math.floor(Math.random() * 1000) % this.network.peers.length]
        }
        cb(error, response, body)
      }
    )
  }

  findEnabledPeers (cb) {
    var peers = []
    this.getFromNode('/peer/list', function (err, response, body) {
      if (err || body === 'undefined') {
        cb(peers)
      }
      var respeers = JSON.parse(body).peers
      .filter(function (peer) {
        return peer.status === 'OK'
      })
      .map(function (peer) {
        return `${peer.ip}:${peer.port}`
      })
      async.each(respeers, function (peer, eachcb) {
        this.getFromNode(`http://${peer}/api/blocks/getHeight`, function (error, res, body2) {
          if (!error && body2 !== 'Forbidden') {
            peers.push(peer)
          }
          eachcb()
        })
      }, function (error) {
        if (error) return cb(error)

        return cb(peers)
      })
    })
  }

  postTransaction (transaction, cb) {
    request(
      {
        url: `http://${this.server}/peer/transactions`,
        headers: {
          nethash: this.network.nethash,
          version: '1.0.0',
          port: 1
        },
        method: 'POST',
        json: true,
        body: {transactions: [transaction]}
      },
      cb
    )
  }

  async broadcast (transaction) {
    this.network.peers.slice(0, 10).forEach((peer) => {
      // Console.log("sending to", peer)
      request({
        url: `http://${peer}/peer/transactions`,
        headers: {
          nethash: this.network.nethash,
          version: '1.0.0',
          port: 1
        },
        method: 'POST',
        json: true,
        body: {transactions: [transaction]}
      })
    })
  }

  connectToNetwork (netw, callback) {
    this.setNetwork(netw)
    this.setServer(netw.peers[Math.floor(Math.random() * 1000) % netw.peers.length])

    this.findEnabledPeers(function (peers) {
      if (peers.length > 0) {
        [this.server] = peers
        netw.peers = peers
      }
      callback()
    })
    this.getFromNode('/api/loader/autoconfigure', function (err, response, body) {
      if (err) return
      if (!body || !body.startsWith('{')) { this.connectToNetwork(netw, callback) } else {
        netw.config = JSON.parse(body).network
      }
    })
  }

  connect (req, res, next) {
    if (!this.server || !this.network || this.network.name !== req.params.network) {
      if (networks[req.params.network]) {
        arkjs.crypto.setNetworkVersion(networks[req.params.network].version)
        this.connectToNetwork(networks[req.params.network], next)
      } else {
        res.send({
          success: false,
          error: `Could not find network ${req.params.network}`
        })
        res.end()
      }
    } else {
      next()
    }
  }
}

module.exports = new Network()

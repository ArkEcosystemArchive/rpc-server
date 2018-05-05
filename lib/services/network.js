const axios = require('axios')
const async = require('async')
const arkjs = require('arkjs')
const logger = require('./logger')
const networks = require('../config/networks')

class Network {
  setNetwork (network) {
    this.network = networks[network]

    return this.network
  }

  setServer (server) {
    this.server = server

    return this.server
  }

  async getFromNode (url) {
    const nethash = this.network ? this.network.nethash : null

    if (!url.startsWith('http')) {
      url = `http://${this.server}${url}`
    }

    try {
      logger.info(`Sending request on "${this.network.name}" to "${url}"`)
      return axios.get(url, { headers: { nethash, version: '2.0.0', port: 1 } })
    } catch(err) {
      logger.error(err.message)

      this.server = this.network.peers[Math.floor(Math.random() * 1000) % this.network.peers.length]
    }
  }

  async findEnabledPeers () {
    let peers = []

    const checkPeerCount = (peers) => {
      if (peers.length > 0) {
        [this.server] = peers
        this.network.peers = peers
      }
    }

    try {
      const response = await this.getFromNode('/peer/list')

      const availablePeers = response.data.peers
        .filter((peer) => (peer.status === 'OK'))
        .map((peer) => (`${peer.ip}:${peer.port}`))

      for (let i = availablePeers.length - 1; i >= 0; i--) {
        try {
          await this.getFromNode(`http://${availablePeers[i]}/api/blocks/getHeight`)

          peers.push(availablePeers[i])

          checkPeerCount(peers)
        } catch(err) {
          logger.error(err)
        }
      }
    } catch(err) {
      logger.error(err)
    }
  }

  async postTransaction (transaction, peer) {
    const server = peer ? peer : this.server

    return axios.post(`http://${server}/peer/transactions`, {
      transactions: [transaction]
    }, {
      headers: {
        nethash: this.network.nethash,
        version: '1.0.0',
        port: 1
      }
    })
  }

  async broadcast (transaction) {
    const peers = this.network.peers.slice(0, 10)

    for (let i = peers.length - 1; i >= 0; i--) {
      logger.info(`Broadcasting to ${peers[i]}`)

      await this.postTransaction(transaction, peers[i])
    }
  }

  connect (req, res, next) {
    if (!this.server || !this.network || this.network.name !== req.params.network) {
      if (networks[req.params.network]) {
        arkjs.crypto.setNetworkVersion(networks[req.params.network].version)

        return this.connectToNetwork(networks[req.params.network])
      }

      return {
        success: false,
        error: `Could not find network ${req.params.network}`
      }
    }
  }

  async connectToNetwork (network, callback) {
    network = this.setNetwork(network)
    this.setServer(network.peers[Math.floor(Math.random() * 1000) % network.peers.length])

    await this.findEnabledPeers()

    try {
      await this.getFromNode('/api/loader/autoconfigure')

      this.network.config = response.network
    } catch(err) {
      this.connectToNetwork(network, callback)
    }
  }
}

module.exports = new Network()

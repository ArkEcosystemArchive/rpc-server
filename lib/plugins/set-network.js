'use strict'

const network = require('../services/network')
const logger = require('../services/logger')

/**
 * The register method used by hapi.js.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  server.ext({
    type: 'onPostAuth',
    method: async (request, h) => {
      network.connectToNetwork(request.params.network)

      return h.continue
    }
  })
}

/**
 * The struct used by hapi.js.
 * @type {Object}
 */
exports.plugin = {
  name: 'rpc-set-network',
  version: '1.0.0',
  register
}

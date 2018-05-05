'use strict'

const handler = require('./handlers/transaction')

/**
 * Register the v1 routes.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  server.route([
    { method: 'POST', path: '/{network}/transaction/bip38', ...handler.createBip38 },
    { method: 'POST', path: '/{network}/transaction', ...handler.create },
    { method: 'POST', path: '/{network}/broadcast', ...handler.broadcast }
  ])
}

/**
 * The struct used by hapi.js.
 * @type {Object}
 */
exports.plugin = {
  name: 'Transaction Routes',
  version: '1.0.0',
  register
}

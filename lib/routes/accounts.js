'use strict'

const handler = require('../handlers/accounts')

/**
 * Register the v1 routes.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  server.route([
    { method: 'GET', path: '/{network}/accounts/bip38/{userId}', ...handler.getBip38Account },
    { method: 'GET', path: '/{network}/accounts/{address}', ...handler.show },
    { method: 'POST', path: '/{network}/accounts/bip38', ...handler.createBip38 },
    { method: 'POST', path: '/{network}/accounts', ...handler.create },
    { method: 'GET', path: '/{network}/accounts/{address}/transactions', ...handler.transactions }
  ])
}

/**
 * The struct used by hapi.js.
 * @type {Object}
 */
exports.plugin = {
  name: 'Accounts Routes',
  version: '1.0.0',
  register
}

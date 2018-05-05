'use strict'

const handler = require('./handlers/account')

/**
 * Register the v1 routes.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  server.route([
    { method: 'GET', path: '/{network}/account/bip38/{userid}', ...handler.getBip38Account },
    { method: 'GET', path: '/{network}/account/{address}', ...handler.show },
    { method: 'POST', path: '/{network}/account/bip38', ...handler.createBip38 },
    { method: 'POST', path: '/{network}/account', ...handler.create },
    { method: 'GET', path: '/{network}/transactions/{address}', ...handler.transactions }
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

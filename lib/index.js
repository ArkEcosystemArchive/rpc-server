'use strict'

const Hapi = require('hapi')
const logger = require('./services/logger')

/**
 * Create a new hapi.js server.
 * @param  {Object} options
 * @return {Hapi.Server}
 */
module.exports = async (options) => {
  if (options.allowRemote) {
    logger.warn('ARK-RPC allows remote connections, this is a potential security risk!')
  }

  const server = new Hapi.Server({ port: options.port })
  server.app.allowRemote = options.allowRemote || false
  server.app.allow = options.allow || {}

  await server.register(require('./plugins/restrict-host'))
  await server.register(require('./plugins/set-network'))

  await server.register(require('./routes/accounts'))
  await server.register(require('./routes/transactions'))

  try {
    await server.start()

    logger.info(`RPC Server is available and listening on ${server.info.uri}`)

    return server
  } catch (error) {
    logger.error(error.message)

    process.exit(1)
  }
}

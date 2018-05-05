'use strict'

const Hapi = require('hapi')

/**
 * Create a new hapi.js server.
 * @param  {Object} options
 * @return {Hapi.Server}
 */
module.exports = async (options) => {
  if (options.allowRemote) {
    console.log('Warning! ark-rpc allows remote connections, this is potentially insecure!')
  }

  const server = new Hapi.Server({ port: options.port })

  await server.register({ plugin: require('./plugins/restrict-host') })
  await server.register({ plugin: require('./routes/accounts') })
  await server.register({ plugin: require('./routes/transactions') })

  try {
    await server.start()

    console.log(`RPC Server is available and listening on ${server.info.uri}`)

    return server
  } catch (error) {
    console.error(error.stack)

    process.exit(1)
  }
}

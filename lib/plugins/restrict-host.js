'use strict'

/**
 * The register method used by hapi.js.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  server.ext({
    type: 'onRequest',
    method: async (request, h) => {
      let remoteAddress = request.info.remoteAddress

      if (remoteAddress.startsWith('::ffff:')) {
        remoteAddress = remoteAddress.replace('::ffff:', '')
      }

      if (options.allowRemote) {
        return h.continue
      }

      if (request.path.includes('broadcast')) {
        return h.continue
      }

      if (Array.isArray(options.allow)) {
        if (options.allow.includes(remoteAddress)) {
          return h.continue
        }

        for (let item of options.allow) {
          let mask = item.split(/[\:\.]/)
          let address = remoteAddress.split(/[\:\.]/)

          for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '*') {
              continue
            }

            if (mask[i] !== address[i]) {
              break
            }

            continue
          }
        }
      }

      return h.continue
    }
  })
}

/**
 * The struct used by hapi.js.
 * @type {Object}
 */
exports.plugin = {
  name: 'rpc-restrict-host',
  version: '1.0.0',
  register
}

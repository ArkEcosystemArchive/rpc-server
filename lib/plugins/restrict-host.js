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
      let remote = request.info.remoteAddress

      if (remote.startsWith('::ffff:')) {
        remote = remote.replace('::ffff:', '')
      }

      if(request.server.app.allowRemote) {
        return h.continue
      }

      if(request.path.includes('broadcast')) {
        return h.continue
      }

      if(request.server.app.allow.includes(remote)) {
        return h.continue
      }

      for(let item of request.server.app.allow) {
        let mask = item.split(/[\:\.]/)
        let address = remote.split(/[\:\.]/)
        let ok = true

        for (let i = 0; i < mask.length; i++) {
          if (mask[i] === '*') {
            continue
          }

          if (mask[i] !== address[i]) {
            ok = false
            break
          }

          continue
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

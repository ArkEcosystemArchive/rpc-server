'use strict'

// function restrictHost(req, res, next){
//   var remote = req.connection.remoteAddress;
//   if (remote.startsWith("::ffff:")) remote = remote.replace("::ffff:", "");
//   if(program.allowRemote) return next();
//   else
//     if(req.getRoute().path == '/:network/broadcast') return next();
//     else
//       if(program.allow.includes(remote)) return next();
//       else
//         for(let item of program.allow) {
//           let mask = item.split(/[\:\.]/);
//           let address = remote.split(/[\:\.]/);
//           let ok = true;
//           for (let i = 0; i < mask.length; i++)
//             if (mask[i] === "*") continue;
//             else
//               if (mask[i] !== address[i]) { ok = false; break; }
//               else continue;
//           if (ok) return next();
//         };
//   res.end();
// }

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
      //
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

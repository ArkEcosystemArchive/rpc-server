const arkjs = require('arkjs')
const bip39 = require('bip39')
const bip38 = require('bip38')
const network = require('../services/network')
const database = require('../services/database')
const getBip38Keys = require('../utils/bip38-keys')

/**
 * @type {Object}
 */
exports.show = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    try {
      const response = await network.getFromNode(`/api/accounts?address=${request.params.address}`)

      return response.data
    } catch (err) {
      return { success: false, err }
    }
  }
}

/**
 * @type {Object}
 */
exports.transactions = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    const offset = request.query.offset || 0

    try {
      return network.getFromNode('/api/transactions', {
        offset: offset,
        orderBy: 'timestamp:desc',
        senderId: request.params.address,
        recipientId: request.params.address
      })
    } catch (err) {
      return { success: false, err }
    }
  }
}

/**
 * @type {Object}
 */
exports.getBip38Account = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    const wif = await database.getUTF8(arkjs.crypto.sha256(Buffer.from(request.params.userid)).toString('hex'))

    try {
      return { success: true, wif }
    } catch (err) {
      return { success: false, err }
    }
  }
}

/**
 * @type {Object}
 */
exports.createBip38 = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    if (request.params.bip38 && request.params.userid) {
      try {
        const account = await getBip38Keys(request.params.userid, request.params.bip38)

        return {
          success: true,
          publicKey: account.keys.getPublicKeyBuffer().toString('hex'),
          address: account.keys.getAddress(),
          wif: account.wif
        }
      } catch (e) {
        const keys = arkjs.crypto.getKeys(bip39.generateMnemonic())

        const encryptedWif = bip38.encrypt(keys.d.toBuffer(32), true, request.params.bip38 + request.params.userid)
        database.setUTF8(arkjs.crypto.sha256(Buffer.from(request.params.userid)).toString('hex'), encryptedWif)

        return { keys, wif: encryptedWif }
      }
    }

    return {
      success: false,
      err: 'Wrong parameters'
    }
  }
}

/**
 * @type {Object}
 */
exports.create = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    if (request.params.passphrase) {
      const account = arkjs.crypto.getKeys(request.params.passphrase)

      return {
        success: true,
        account: {
          publicKey: account.publicKey,
          address: arkjs.crypto.getAddress(account.publicKey)
        }
      }
    }

    return {
      success: false,
      err: 'Wrong parameters'
    }
  }
}

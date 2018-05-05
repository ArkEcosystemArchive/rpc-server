const arkjs = require('arkjs')
const getBip38Keys = require('../utils/bip38-keys')
const network = require('../services/network')
const database = require('../services/database')
const logger = require('../services/logger')

/**
 * @type {Object}
 */
exports.index = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    const transactions = [] // await db.get('transactions')

    return { transactions }
  }
}

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
      return network.getFromNode(`/api/transactions/get?id=${request.params.id}`)
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
    try {
      const acc = await getBip38Keys(request.payload.userId, request.payload.bip38)

      let transaction = arkjs.transaction.createTransaction(request.payload.recipientId, request.payload.amount, null, 'dummy')
      transaction.senderPublicKey = acc.keys.getPublicKeyBuffer().toString('hex')

      delete transaction.signature
      arkjs.crypto.sign(transaction, acc.keys)
      transaction.id = arkjs.crypto.getId(transaction)

      await database.setObject(transaction.id, transaction)

      return { success: true, transaction }
    } catch (err) {
      logger.error(error.message)

      return { success: false, err }
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
    const amount = parseInt(request.payload.amount)
    const transaction = arkjs.transaction.createTransaction(request.payload.recipientId, amount, null, request.payload.passphrase)

    try {
      await database.setObject(transaction.id, transaction)
      return { success: true, transaction }
    } catch (err) {
      return { success: false, err }
    }
  }
}

/**
 * @type {Object}
 */
exports.broadcast = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    if (request.payload.transactions) { // old way
      await Promise.all(request.payload.transactions.map((transaction) => network.broadcast(transaction, () => Promise.resolve(transaction))))

      return {
        success: true,
        transactionIds: request.payload.transactions.map((tx) => tx.id)
      }
    }

    try {
      let transaction = await database.getObject(request.payload.id)
      transaction = transaction || request.payload

      if (!arkjs.crypto.verify(transaction)) {
        return {
          success: false,
          error: 'transaction does not verify',
          transaction
        }
      }

      await network.broadcast(transaction)

      return { success: true, transaction }
    } catch (err) {
      return { success: false, err }
    }
  }
}

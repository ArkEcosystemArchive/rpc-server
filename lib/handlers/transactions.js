const arkjs = require('arkjs')
const getBip38Keys = require('../utils/bip38-keys')
const network = require('../services/network')
const database = require('../services/database')

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
      const acc = getBip38Keys(request.params.userid, request.params.bip38)

      let transaction = arkjs.transaction.createTransaction(request.params.recipientId, request.params.amount, null, 'dummy')
      transaction.senderPublicKey = acc.keys.getPublicKeyBuffer().toString('hex')

      delete transaction.signature
      arkjs.crypto.sign(transaction, acc.keys)
      transaction.id = arkjs.crypto.getId(transaction)

      try {
        await database.setObject(transaction.id, transaction)

        return { success: true, transaction }
      } catch (err) {
        return { success: false, err }
      }
    } catch (err) {
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
    const amount = parseInt(request.params.amount)
    const transaction = arkjs.transaction.createTransaction(request.params.recipientId, amount, null, request.params.passphrase)

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
    if (request.params.transactions) { // old way
      await Promise.all(request.params.transactions.map((transaction) => network.broadcast(transaction, () => Promise.resolve(transaction))))

      return {
        success: true,
        transactionIds: request.params.transactions.map((tx) => tx.id)
      }
    }

    try {
      let transaction = await database.getObject(request.params.id)
      transaction = transaction || request.params

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

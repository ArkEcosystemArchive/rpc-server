const network = require('../services/network')

/**
 * @type {Object}
 */
exports.latest = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  handler: async (request, h) => {
    try {
      const response = await network.getFromNode('/api/blocks?orderBy=height:desc&limit=1')

      return {
        success: true,
        block: response.data.blocks[0]
      }
    } catch (err) {
      return { success: false, err }
    }
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
      const response = await network.getFromNode(`/api/blocks/get?id=${request.params.id}`)

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
      const response = await network.getFromNode('/api/transactions', {
        offset: offset,
        orderBy: 'timestamp:desc',
        blockId: request.params.id
      })

      return response.data
    } catch (err) {
      return { success: false, err }
    }
  }
}

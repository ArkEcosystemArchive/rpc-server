const axios = require('axios')

jest.setTimeout(60000)

describe('Blocks', () => {
  describe('GET /mainnet/blocks/latest', () => {
    it('should get the latest block', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/blocks/latest')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.block.id).toBeNumber()
    })
  })

  describe('GET /mainnet/blocks/{id}', () => {
    it('should get the block information', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/blocks/18017180930038348026')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.block.id).toBe('18017180930038348026')
    })
  })

  describe('GET /mainnet/blocks/{id}/transactions', () => {
    it('should get the block transactions', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/blocks/18017180930038348026/transactions')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.transactions).toHaveLength(50)
    })
  })
})

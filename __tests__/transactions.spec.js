const axios = require('axios')
const arkjs = require('arkjs')

jest.setTimeout(60000)

describe('Transactions', () => {
  describe('/GET transactions', () => {
    it('it should GET last account transactions on mainnet', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/accounts/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv/transactions')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(parseInt(response.data.count)).toBeGreaterThan(3)
      await expect(response.data.transactions.length).toBeGreaterThan(3)
    })
  })

  describe('/POST transactions', () => {
    let transaction
    it('it should create tx on mainnet and tx should verify', async () => {
      const response = await axios.post('http://localhost:8080/mainnet/transactions', {
        amount: 100000000,
        recipientId: 'AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv',
        passphrase: 'This is a test'
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.transaction.recipientId).toBe('AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
      await expect(arkjs.crypto.verify(response.data.transaction)).toBeTruthy()

      transaction = response.data.transaction
    })

    it('it should broadcast tx on mainnet', async () => {
      const response = await axios.post('http://localhost:8080/mainnet/transactions/broadcast', transaction)

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
    })
  })
})

const axios = require('axios')
const arkjs = require('arkjs')

jest.setTimeout(30000)

describe('Transactions', () => {
  describe('/GET transactions', () => {
    it('it should GET last account transactions on mainnet', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/accounts/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv/transactions')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(parseInt(response.data.count)).toBeGreaterThan(3)
      await expect(response.data.transactions.length).toBeGreaterThan(3)
    })

    it('it should GET last account transactions on devnet', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/accounts/DGihocTkwDygiFvmg6aG8jThYTic47GzU9/transactions')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(parseInt(response.data.count)).toBeGreaterThan(3)
      await expect(response.data.transactions.length).toBeGreaterThan(3)
    })
  })

  describe('/POST transactions', () => {
    let mainnettx
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

      mainnettx = response.data.transaction
    })

    it('it should broadcast tx on mainnet', async () => {
      const response = await axios.post('http://localhost:8080/mainnet/transactions/broadcast', mainnettx)

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
    })

    let devnettx
    it('it should create tx on devnet and tx should verify', async () => {
      const response = await axios.post('http://localhost:8080/devnet/transactions', {
        amount: 100000000,
        recipientId: 'DGihocTkwDygiFvmg6aG8jThYTic47GzU9',
        passphrase: 'This is a test'
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.transaction.recipientId).toBe('DGihocTkwDygiFvmg6aG8jThYTic47GzU9')
      await expect(arkjs.crypto.verify(response.data.transaction)).toBeTruthy()

      devnettx = response.data.transaction
    })

    it('it should broadcast tx on devnet', async () => {
      const response = await axios.post('http://localhost:8080/devnet/transactions/broadcast', devnettx)

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
    })

    it('it should broadcast tx on devnet the old way', async () => {
      const response = await axios.post('http://localhost:8080/devnet/transactions/broadcast', {
        transactions: [devnettx]
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.transactionIds[0]).toBe(devnettx.id)
    })
  })
})

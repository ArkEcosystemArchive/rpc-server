const axios = require('axios')
const arkjs = require('arkjs')

jest.setTimeout(60000)

describe('Accounts', () => {
  describe('/GET account', () => {
    it('it should GET account with a given address on mainnet', async () => {
      const response = await axios.get('http://localhost:8080/mainnet/accounts/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.account.address).toBe('AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
    })
  })

  describe('/POST account', () => {
    it('it should create an account on mainnet', async () => {
      const response = await axios.post('http://localhost:8080/mainnet/accounts', {
        passphrase: 'this is a test'
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.account.address).toBe('AUdAwTiByRp5BFyGz9uxXuNYa1KGHT4rmt')
      await expect(response.data.account.publicKey).toBe('03675c61dcc23eab75f9948c6510b54d34fced4a73d3c9f2132c76a29750e7a614')
    })

    let bip38address
    let bip38backup
    let userId = require('crypto').randomBytes(32).toString('hex')

    it('it should create an account on mainnet using bip38 encryption', async () => {
      const response = await axios.post('http://localhost:8080/mainnet/accounts/bip38', {
        bip38: 'master password',
        userId
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data).toHaveProperty('address')
      await expect(response.data).toHaveProperty('publicKey')
      await expect(response.data).toHaveProperty('wif')

      bip38address = response.data.address
      bip38backup = response.data.wif
    })

    it('it should find bip38 backup from userId', async () => {
      const response = await axios.get(`http://localhost:8080/mainnet/accounts/bip38/${userId}`)

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data).toHaveProperty('wif')
      await expect(response.data.wif).toBe(bip38backup)
    })

    it('it should create transaction from bip38 backup using userId', async () => {
      const response = await axios.post(`http://localhost:8080/mainnet/transactions/bip38`, {
        bip38: 'master password',
        userId,
        amount: 1000000000,
        recipientId: 'AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv'
      })

      await expect(response.status).toBe(200)
      await expect(response.data.success).toBe(true)
      await expect(response.data.transaction.recipientId).toBe('AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv')
      await expect(arkjs.crypto.verify(response.data.transaction)).toBeTruthy()
    })
  })
})

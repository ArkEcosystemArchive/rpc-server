![ARK-RPC](https://cdn-images-1.medium.com/max/2000/1*QFNTgOOP_9NIaNwIrBnp_w.png)

### RPC server implementation to easily connect to ARK blockchain

# Security Warning
All calls should be made from the server where RPC is running at ( i.e., `localhost` or `127.0.0.1` ). The RPC server should never be publicly accessible.

# How To Use It
- install Node.JS ( https://nodejs.org/en/download/package-manager/)
- install forever `npm install -g forever`
- install ark-rpc: `npm install arkecosystem/ark-rpc#master`
- start RPC server: `ark-rpc --port 8000` (default port is 8080)

# API
Supported networks are `mainnet` and `devnet` all calls should start with the network you want to address, for instance,  `/mainnet/account/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv` we call it `:network` in the API description.

## Accounts
- Get account balance from `address`: `GET /:network/account/:address`
- Create account from `passphrase`: `POST /:network/account` params: `passphrase`

## Transactions
- Get last 50 transactions from `address`: `GET /:network/transactions/:address`
- Create a transaction: `POST /:network/transaction` params: `recipientId`, `amount` in satoshis, `passphrase`
- Broadcast transaction: `POST /:network/broadcast` params: `id` of the transaction

Note that if the transaction has been created via the RPC it has been stored internally, as such only the transaction `id` is needed to broadcast/rebroadcast it. Otherwise if created outside of this RPC server, pass the whole transaction body as the POST payload.

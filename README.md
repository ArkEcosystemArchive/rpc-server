![ARK-RPC](https://cdn-images-1.medium.com/max/2000/1*QFNTgOOP_9NIaNwIrBnp_w.png)

RPC server to connect to blockchain ARK

# security warning
All the call should be made from the server the rpc is running (ie `localhost` or `127.0.0.1`). The rpc server should never be publicly accessible.

# How to use it
- install nodejs
- install ark-rpc: `npm install arkecosystem/ark-rpc#master`
- start rpc server: `cd ark-rpc && npm start`

# API
supported networks are `mainnet` and `devnet` all calls should start with the network you want to address, for instance `/mainnet/account/AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv` we call it `:network` in the api description

## accounts
- get account balance from `address`: `GET /:network/account/:address`
- create account from `passphrase`: `POST /:network/account` params: `passphrase`

## transactions
- get last 50 transactions from `address`: `GET /:network/transactions/:address`
- create a transaction: `POST /:network/transaction` params: `recipientId`, `amount` in satoshi, `passphrase`
- broadcast transaction: `POST /:network/broadcast` params: `id` of the transaction
Note that if the transaction has been created via the RPC, it has been stored internally, only the transaction `id` is needed to broadcast/rebroadcast. Otherwise if created out of this RPC server, pass the whole transaction body as the POST payload

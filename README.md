# EVC & Zaad APIs

## Usage

Import the package main method:

```js
const evc = require('evc-api')
```

```js
evc({
  merchant_u_id: 'merchant_u_id',
  api_user_id: 'api_user_id',
  api_key: 'api_key',
  client_mobile_number: 'client_mobile_number',
  description: 'description',
  amount: 'amount',
}).then((data) => data)
```

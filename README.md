# EVC APIs

## Usage

```js
const evc = require('evc-api')
```

```js
evc({
  merchant_u_id: 'M*******',
  api_user_id: '1******',
  api_key: 'API-*************',
  client_mobile_number: '6********',
  description: 'description.......',
  amount: '150',
  auto_withdraw: true, // `true` if auto withdraw else `false`
  merchant_no: '*********', // withdraw to ...
}).then((data) => data)
```

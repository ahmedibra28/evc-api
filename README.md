# EVC APIs

## Usage

```js
const evc = require('evc-api')
```

```js
evc({
  merchantUId: 'M*******',
  apiUserId: '1******',
  apiKey: 'API-*************',
  customerMobileNumber: '6********',
  description: 'description.......',
  amount: '150',
  autoWithdraw: true, // `true` if auto withdraw else `false`
  merchantNo: '*********', // withdraw to ...
}).then((data) => data)
```

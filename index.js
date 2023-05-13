const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

async function evc(props) {
  try {
    if (!props) return 'you have to provide an object props'

    let {
      merchantUId,
      apiUserId,
      apiKey,
      customerMobileNumber,
      description,
      amount,
      autoWithdraw,
      merchantNo,
    } = props

    const responseMsg = (status, message) => ({
      status,
      message,
    })

    if (!merchantUId) return responseMsg(400, 'Merchant user id is required')
    if (!apiUserId) return responseMsg(400, 'API user id is required')
    if (!apiKey) return responseMsg(400, 'API key is required')
    if (!customerMobileNumber)
      return responseMsg(400, 'Customer mobile number is required')
    if (!description) return responseMsg(400, 'Description is required')
    if (!amount) return responseMsg(400, 'Amount is required')
    if (customerMobileNumber.toString().length !== 12)
      return responseMsg(400, 'Customer mobile number must be 12 digits')

    if (autoWithdraw) {
      if (merchantNo?.toString().length !== 9)
        return responseMsg(400, 'Merchant number must be 9 digits')
    }

    const paymentObject = {
      schemaVersion: '1.0',
      requestId: uuidv4(),
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: merchantUId,
        apiUserId: apiUserId,
        apiKey: apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: customerMobileNumber,
        },
        transactionInfo: {
          referenceId: uuidv4(),
          invoiceId: `${uuidv4().slice(0, 5)}-${customerMobileNumber}`,
          amount: Number(amount),
          currency: 'USD',
          description: description,
        },
      },
    }

    const netAmount = Number(amount) * 0.01

    const withdrawalObject = {
      schemaVersion: '1.0',
      requestId: uuidv4(),
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_CREDITACCOUNT',
      serviceParams: {
        merchantUid: merchantUId,
        apiUserId: apiUserId,
        apiKey: apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: merchantNo,
          accountType: 'MERCHANT',
        },
        transactionInfo: {
          referenceId: uuidv4(),
          invoiceId: `${uuidv4().slice(0, 5)}-${merchantNo}`,
          amount: Number(amount) - netAmount,
          currency: 'USD',
          description: description,
        },
      },
    }

    const { data } = await axios.post(
      `https://api.waafipay.net/asm`,
      paymentObject
    )

    // 5206 => payment has been cancelled
    // 2001 => payment has been done successfully
    if (Number(data.responseCode) === 2001) {
      if (autoWithdraw) {
        await axios.post(`https://api.waafipay.net/asm`, withdrawalObject)
      }
    }
    return await data
  } catch ({ message }) {
    return message
  }
}

module.exports = evc

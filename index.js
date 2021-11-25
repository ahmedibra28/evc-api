const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

async function EVC(props) {
  try {
    if (!props) return 'you have to provide an object props'

    const {
      merchant_u_id,
      api_user_id,
      api_key,
      client_mobile_number,
      description,
      amount,
    } = props

    if (!merchant_u_id) return 'merchant_u_id is required'
    if (!api_user_id) return 'api_user_id is required'
    if (!api_key) return 'api_key is required'
    if (!client_mobile_number) return 'client_mobile_number is required'
    if (!description) return 'description is required'
    if (!amount) return 'amount is required'
    if (client_mobile_number.toString().length !== 9)
      return 'client_mobile_number is not valid'

    const paymentObject = {
      schemaVersion: '1.0',
      requestId: uuidv4(),
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: merchant_u_id,
        apiUserId: api_user_id,
        apiKey: api_key,
        paymentMethod: 'mwallet_account',
        payerInfo: {
          accountNo: `252${client_mobile_number}`,
        },
        transactionInfo: {
          referenceId: uuidv4(),
          invoiceId: uuidv4(),
          amount: amount,
          currency: 'USD',
          description: description,
        },
      },
    }

    const { data } = await axios.post(
      `https://api.waafi.com/asm`,
      paymentObject
    )

    // 5206 => payment has been cancelled
    // 2001 => payment has been done successfully
    if (await data) {
      return await data
    } else {
      return 'Something went wrong!'
    }
  } catch (error) {
    return error
  }
}

module.exports = EVC

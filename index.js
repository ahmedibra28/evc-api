const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

// get EVC from customer/buyer
async function evc(props) {
  try {
    if (!props) return 'you have to provide an object props'

    const {
      merchant_u_id,
      api_user_id,
      api_key,
      client_mobile_number,
      description,
      amount,
      merchant_no,
      auto_withdraw,
    } = props

    const responseMsg = (responseCode, responseMsg) => ({
      responseCode,
      responseMsg,
    })

    if (!merchant_u_id) return responseMsg(400, 'merchant_u_id is required')
    if (!api_user_id) return responseMsg(400, 'api_user_id is required')
    if (!api_key) return responseMsg(400, 'api_key is required')
    if (!client_mobile_number)
      return responseMsg(400, 'client_mobile_number is required')
    if (!description) return responseMsg(400, 'description is required')
    if (!amount) return responseMsg(400, 'amount is required')
    if (client_mobile_number.toString().length !== 9)
      return responseMsg(400, 'client_mobile_number must be 9 digits')

    if (auto_withdraw) {
      if (merchant_no.toString().length !== 9)
        return responseMsg(400, 'merchant_no must be 9 digits')
    }

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
          invoiceId: `${uuidv4().slice(0, 5)}-${client_mobile_number}`,
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
        merchantUid: merchant_u_id,
        apiUserId: api_user_id,
        apiKey: api_key,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: merchant_no,
          accountType: 'MERCHANT',
        },
        transactionInfo: {
          referenceId: uuidv4(),
          invoiceId: `${uuidv4().slice(0, 5)}-${merchant_no}`,
          amount: Number(amount) - netAmount,
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
    if (Number(data.responseCode) === 2001) {
      if (auto_withdraw) {
        await axios.post(`https://api.waafi.com/asm`, withdrawalObject)
      }
    }
    return await data
  } catch (error) {
    return error
  }
}

module.exports = evc

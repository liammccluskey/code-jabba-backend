const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    recruiterPremiumPaymentSuccess: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Payment success',
        message: `Welcome to the Code Jabba Recruiter Premium plan, your payment was successful. You can now post unlimited active jobs at a time.`,
        includeMessageWrapper: true,
    },
    recruiterPremiumPaymentFailed: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Payment failed',
        message: `Your payment method for the Code Jabba Recruiter Premium plan failed.`,
        includeMessageWrapper: true,
    },
    recruiterPremiumCancellation: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Cancellation',
        message: `You have successfully cancelled you subscription to the Code Jabba Recruiter Premium plan. Your will still have all your subscription benefits until the end of the billing cycle.`,
        includeMessageWrapper: true,
    },
}

module.exports = {
    NOTIFICATIONS
}
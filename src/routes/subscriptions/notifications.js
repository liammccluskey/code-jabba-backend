const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    recruiterPremiumPaymentSuccess: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Payment success',
        message: `Welcome to the Code Jabba Recruiter Premium plan, your payment was successful. You can now have access to all the Recruiter Premium plan benefits`,
        includeMessageWrapper: true,
    },
    recruiterPremiumPaymentFailed: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Payment failed',
        message: `Your payment method for the Code Jabba Recruiter Premium plan failed.`,
        includeMessageWrapper: true,
    },
    recruiterPremiumCancellation: { // sent at end of billing cycle when subscription is cancelled
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Cancellation',
        message: `Your subscription to the Code Jabba Recruiter Premium plan has ended. You no longer have access to the Recruiter Premium plan benefits.`,
        includeMessageWrapper: true,
    },
    candidatePremiumPaymentSuccess: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Payment success',
        message: `Welcome to the Code Jabba Candidate Premium plan, your payment was successful. You now have access to all the Candidate Premium plan benefits.`,
        includeMessageWrapper: true,
    },
    candidatePremiumPaymentFailed: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Payment failed',
        message: `Your payment method for the Code Jabba Candidate Premium plan failed.`,
        includeMessageWrapper: true,
    },
    candidatePremiumCancellation: { // sent at end of billing cycle when subscription is cancelled
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Cancellation',
        message: `Your subscription to the Code Jabba Candidate Premium plan has ended. You no longer have access to the Candidate Premium plan benefits.`,
        includeMessageWrapper: true,
    },
}

module.exports = {
    NOTIFICATIONS
}
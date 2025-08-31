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
        message: `You have successfully cancelled your subscription to the Code Jabba Recruiter Premium plan. You no longer have access to the Recruiter Premium plan benefits.`,
        includeMessageWrapper: true,
    },
    recruiterPremiumCancellationInitiated: { // sent immediately on request to cancel premium plan
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Cancellation Initiated',
        message: `You have successfully cancelled your subscription to the Code Jabba Recruiter Premium plan. You will still have all your subscription benefits until the end of the billing cycle.`,
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
    candidatePremiumCancellation: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Cancellation',
        message: `You have successfully cancelled your subscription to the Code Jabba Candidate Premium plan. You no longer have access to the Candidate Premium plan benefits.`,
        includeMessageWrapper: true,
    },
    candidatePremiumCancellationInitiated: {
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Cancellation Initiated',
        message: `You have successfully cancelled your subscription to the Code Jabba Candidate Premium plan. You will still have all your subscription benefits until the end of the billing cycle.`,
        includeMessageWrapper: true,
    },
}

module.exports = {
    NOTIFICATIONS
}
const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    recruiterPremiumCancellationInitiated: { // sent immediately on request to cancel premium plan
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Recruiter Premium - Cancellation Initiated',
        message: `You have successfully cancelled your subscription to the Code Jabba Recruiter Premium plan. You will still have all your subscription benefits until the end of the billing cycle.`,
        includeMessageWrapper: true,
    },
    candidatePremiumCancellationInitiated: { // sent immediately on request to cancel premium plan
        channelID: CHANNEL_IDS.subscriptionUpdates,
        subject: 'Candidate Premium - Cancellation Initiated',
        message: `You have successfully cancelled your subscription to the Code Jabba Candidate Premium plan. You will still have all your subscription benefits until the end of the billing cycle.`,
        includeMessageWrapper: true,
    },
}

module.exports = {
    NOTIFICATIONS
}
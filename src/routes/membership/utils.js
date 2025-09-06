const Subscription = require('../../models/Subscription')
const {SUBSCRIPTION_TIERS} = require('../../models/Subscription/constants')

const getUserHasRecruiterPremium = async (userID) => {
    const subscriptionFilter = {user: userID, status: 'active', tier: SUBSCRIPTION_TIERS.recruiterPremium}

    try {
        const subscriptionsCount = await Subscription.find(subscriptionFilter)

        return subscriptionsCount >= 1
    } catch (error) {
        throw error
    }
}

module.exports = {
    getUserHasRecruiterPremium
}
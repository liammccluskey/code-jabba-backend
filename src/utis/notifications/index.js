const User = require('../../models/User')
const Notification = require('../../models/Notification')

export const postAppNotification = async (partialNotification, userID, user=null) => {
    const notification = new Notification({
        ...partialNotification,
        user: userID
    })

    try {
        if (user) {
            await notification.save()
        } else {
            // fetch user

            const {channelID} = partialNotification
            const channelSettingPath = `settings.notifications.app.${channelID}Enabled`

            const channelNotificationsEnabled = await User.findById(userID)
                .lean()
                .select(channelSettingPath)

            if (channelNotificationsEnabled) {
                await notification.save()
            }
        }
    } catch (error) {
        console.log(error)
    }
}
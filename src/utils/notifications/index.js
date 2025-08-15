const nodemailer = require('nodemailer')
require('dotenv/config')

const {getUserFirstName} = require('../../models/User/utils')
const User = require('../../models/User')
const Notification = require('../../models/Notification')

// returns {appNotificationEnabled:boolean, emailNotificationEnabled:boolean, displayName:string, email: string}
const getUserAndChannelNotificationSettings = async (channelID, userID) => {
    const channelEnabledSettingField = `${channelID}Enabled`

    const appChannelNoticationEnabledSettingPath = `settings.appNotifications.${channelEnabledSettingField}`
    const emailChannelNoticationEnabledSettingPath = `settings.emailNotifications.${channelEnabledSettingField}`

    try {
        const user = await User.findById(userID)
            .lean()
            .select(`${appChannelNoticationEnabledSettingPath} ${emailChannelNoticationEnabledSettingPath} displayName email`)

        if (user) {
            const appNotificationEnabled = user['settings']['appNotifcations'][channelEnabledSettingField]
            const emailNotificationEnabled = user['settings']['emailNotifcations'][channelEnabledSettingField]

            console.log(JSON.stringify(
                {appChannelNoticationEnabledSettingPath, emailChannelNoticationEnabledSettingPath, appNotificationEnabled, emailNotificationEnabled}
            , null, 4))

            const {displayName, email} = user
            return {
                appNotificationEnabled,
                emailNotificationEnabled,
                displayName,
                email
            }
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// partialNotification: {channelID, message}
const postAppNotification = async (partialNotification, recipientUserID) => {
    const notification = new Notification({
        ...partialNotification,
        user: recipientUserID
    })
    try {
        await notification.save()
        return true
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// partialNotification: {subject, message, includeMessageWrapper}
const sendEmailNotification = async (partialNotification, recipientEmail, recipientDisplayName) => {
    let transporter 
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NOTIFICATIONS_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        })
    } catch (error) {
        throw(error)
    }


    const {subject, message, includeMessageWrapper} = partialNotification
    const mailOptions = {
        from: process.env.NOTIFICATIONS_EMAIL,
        to: recipientEmail,
        subject,
        text: includeMessageWrapper ?
            `
            Hi ${getUserFirstName(recipientDisplayName)},
            
            ${message}

            - The ${process.env.SITE_NAME} Team

            You can unsubscribe from these emails at the ${process.env.SITE_NAME} advanced settings page.
            `
            : message
        ,
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return !!info
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

// partialNotification: {channelID, subject, message, includeMessageWrapper}
const sendNotificationIfEnabled = async (
    partialNotification, 
    recipientUserID, 
    sendAppNotification, 
    sendEmailNotification
) => {
    const {
        appNotificationEnabled,
        emailNotificationEnabled,
        displayName,
        email
    } = await getUserAndChannelNotificationSettings(partialNotification.channelID, recipientUserID)

    if (sendAppNotification && appNotificationEnabled) {
        await postAppNotification(partialNotification, recipientUserID)
    }

    if (sendEmailNotification && emailNotificationEnabled) {
        await sendEmailNotification(partialNotification, email, displayName)
    }
}




module.exports = {
    sendNotificationIfEnabled
}
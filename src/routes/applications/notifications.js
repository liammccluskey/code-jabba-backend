const {CHANNEL_IDS} = require('../../utils/notifications/constants')
const {getUserFirstName} = require('../../models/User/utils')

const getUpdatedApplicationStatusMessage = (application, isAccept) => {
    const {job, candidate, recruiter} = application
    if (isAccept) {
        return `Hi ${getUserFirstName(candidate.displayName)},\n\nWe are pleased to inform you that your application to ${job.company.name} for the position of ${job.title} has been accepted. We will follow up with next steps soon.\n\nBest regards,\n${recruiter.displayName}\n${job.company.name}`
    } else {
        return `Hi ${getUserFirstName(candidate.displayName)},\n\nWe regret to inform you that after reviewing your application to the ${job.title} position at ${job.company.name}, we will not be moving forward at this time.\n\nThank you for your interest in joining our team, and we wish you the best in your future endeavors.\n\nBest regards,\n${recruiter.displayName}\n${job.company.name}`
    }
}

const NOTIFICATIONS = {
    applicationAccepted: application => ({
        channelID: CHANNEL_IDS.jobUpdates,
        subject: `${application.job.company.name} Application Update - ${application.job.title}`,
        message: getUpdatedApplicationStatusMessage(application, true),
        includeMessageWrapper: false
    }),
    applicationRejected: application => ({
        channelID: CHANNEL_IDS.jobUpdates,
        subject: `${application.job.company.name} Application Update - ${application.job.title}`,
        message: getUpdatedApplicationStatusMessage(application, false),
        includeMessageWrapper: false
    }),
    jobReachedApplicationLimit: jobTitle => ({
        channelID: CHANNEL_IDS.jobUpdates,
        subject: `${jobTitle} was Archived`,
        message: `Your job post for ${jobTitle} has been archived as it has reached the application limit on the free tier. Upgrade to Recruiter Premium if you wish to receive unlimited applications.`,
        includeMessageWrapper: true
    })
}

module.exports = {
    NOTIFICATIONS
}
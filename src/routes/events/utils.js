const Event = require('../../models/Event')

const logEvent = async (eventID, userID=undefined) => {
    const event = new Event({
        event: eventID,
        user: userID
    })
    await event.save()
}

module.exports = {
    logEvent
}
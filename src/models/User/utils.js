const moment = require('moment')

const getUserFirstName = displayName => {
    const hasName = !!displayName
    return hasName ? displayName.split(' ')[0] : `${process.env.SITE_NAME} user`
}

const transformUser = partialUser => {
    if (partialUser.educations) {
        partialUser.educations = [...partialUser.educations].sort( (a, b) => {
            const dateA = moment({month: a.startMonth, year: a.startYear})
            const dateB = moment({month: b.startMonth, year: b.startYear})

            return dateA.isBefore(dateB) ? 1 : -1 
        })
    }

    if (partialUser.workExperiences) {
        partialUser.workExperiences = [...partialUser.workExperiences].sort( (a, b) => {
            const dateA = moment({month: a.startMonth, year: a.startYear})
            const dateB = moment({month: b.startMonth, year: b.startYear})

            return dateA.isBefore(dateB) ? 1 : -1
        })
    }

    if (partialUser.projects) {
        partialUser.projects = [...partialUser.projects].sort( (a, b) => {
            const dateA = moment({month: a.startMonth, year: a.startYear})
            const dateB = moment({month: b.startMonth, year: b.startYear})

            return dateA.isBefore(dateB) ? 1 : -1
        })
    }

    if (partialUser.phoneNumber) {
        let parsedNumber = ''
        const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

        const chars = [...partialUser.phoneNumber]

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i]
            if (nums.includes(char)) {
                parsedNumber += char
            }
        }

        partialUser.phoneNumber = parsedNumber
    }


    return partialUser
}

const formatUser = user => {
    const {
        resumeURL,
        email, phoneNumber, address,
        linkedInURL,
        languages,
        skills,
        educations,
        projects,
        questions
    } = user

    const updatedUser = {
        ...user,
        resumeCompleted: !!resumeURL,
        generalCompleted:  !!email && !!phoneNumber && !!address,
        socialsCompleted: !!linkedInURL,
        languagesCompleted: languages.length > 0,
        skillsCompleted: skills.length > 0,
        educationCompleted: educations.length > 0,
        projectsCompleted: projects.length > 0,
        questionsCompleted: questions.length > 0,
    }

    const {
        resumeCompleted,
        generalCompleted, 
        socialsCompleted, 
        languagesCompleted, 
        skillsCompleted, 
        educationCompleted, 
        projectsCompleted, 
        questionsCompleted
    } = updatedUser

    return {
        ...updatedUser,
        canApplyToJobs: resumeCompleted &&
            generalCompleted && 
            socialsCompleted && 
            languagesCompleted && 
            skillsCompleted && 
            educationCompleted && 
            projectsCompleted && 
            questionsCompleted
        ,
        canPostJobs: educationCompleted && socialsCompleted
    
    }
}

module.exports = {
    getUserFirstName,
    transformUser,
    formatUser
}
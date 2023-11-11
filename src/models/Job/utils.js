const moment = require('moment')

const {HOURS_PER_WEEK, WORK_WEEKS_PER_YEAR} = require('./constants')

const getMinExperienceLevel = experienceLevels => {
    if (experienceLevels.includes('entry')) return 'entry'
    if (experienceLevels.includes('mid')) return 'mid'
    if (experienceLevels.includes('senior')) return 'senior'
    if (experienceLevels.includes('staff')) return 'staff'
    if (experienceLevels.includes('principal')) return 'principal'
}

const getMaxExperienceLevel = experienceLevels => {
    if (experienceLevels.includes('principal')) return 'principal'
    if (experienceLevels.includes('staff')) return 'staff'
    if (experienceLevels.includes('senior')) return 'senior'
    if (experienceLevels.includes('mid')) return 'mid'
    if (experienceLevels.includes('entry')) return 'entry'
}

const getMinExperienceYears = experienceYears => {
    return experienceYears.map( years => Number(years)).sort((a, b) => a - b)[0]
}

const getMaxExperienceYears = experienceYears => {
    return experienceYears.map( years => Number(years)).sort((a, b) => b - a)[0]
}

const transformJob = (job, recruiterID=null, isPosting=false) => {
    if (job.salaryFrequency === 'hour' && job.salaryType === 'exact') {
        job.estimatedSalaryMin = job.salaryExact * HOURS_PER_WEEK * WORK_WEEKS_PER_YEAR
        job.estimatedSalaryMax = job.salaryExact * HOURS_PER_WEEK * WORK_WEEKS_PER_YEAR
    } else if (job.salaryFrequency === 'hour' && job.salaryType === 'range') {
        job.estimatedSalaryMin = job.salaryMin * HOURS_PER_WEEK * WORK_WEEKS_PER_YEAR
        job.estimatedSalaryMax = job.salaryMax * HOURS_PER_WEEK * WORK_WEEKS_PER_YEAR
    }
    else if (job.salaryFrequency === 'year' && job.salaryType === 'exact') {
        job.estimatedSalaryMin = job.salaryExact
        job.estimatedSalaryMax = job.salaryExact
    } else if (job.salaryFrequency === 'year' && job.salaryType === 'range') {
        job.estimatedSalaryMin = job.salaryMin
        job.estimatedSalaryMax = job.salaryMax
    } else if (job.salaryType === 'not-provided') {
        job.estimatedSalaryMin = 0
        job.estimatedSalaryMax = 0
    }

    if (job.experienceLevels) {
        job.minExperienceLevel = getMinExperienceLevel(job.experienceLevels)
        job.maxExperienceLevel = getMaxExperienceLevel(job.experienceLevels)
    }

    if (job.experienceYears) {
        job.minExperienceYears = getMinExperienceYears(job.experienceYears)
        job.maxExperienceYears = getMaxExperienceYears(job.experienceYears)
    }
    
    if (recruiterID) {
        job.recruiter = recruiterID
    }

    if (isPosting) {
        job.postedAt = moment().toISOString()
    }

    return job
}

module.exports = {
    transformJob,
    getMinExperienceLevel,
    getMinExperienceYears,
}
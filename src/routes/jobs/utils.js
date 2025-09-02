const moment = require('moment')

function removeEmptyObjects(obj) {
    if (Array.isArray(obj)) {
      return obj
        .map(removeEmptyObjects)
        .filter(item => !(typeof item === 'object' && item !== null && Object.keys(item).length === 0));
    }
  
    if (typeof obj === 'object' && obj !== null) {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = removeEmptyObjects(value);
        if (
          !(typeof cleanedValue === 'object' && cleanedValue !== null && Object.keys(cleanedValue).length === 0)
        ) {
          cleaned[key] = cleanedValue;
        }
      }
      return cleaned;
    }
  
    return obj;
  }

const generateMongoFilterFromJobFilters = ({
    datePosted, // '' | past-day | past-week | past-month
    employmentTypes, // [internship | part-time | contract | full-time]
    settings, // [on-site | hybrid | remote]
    positions, // [frontend | backend | full-stack | embedded | qa | test]
    locations, // [string]
    experienceLevels, // [entry | mid | senior | staff | principal]
    experienceYears, // [0, 1 (1-2), 2 (3-4), 3 (5-6), 4 (7-8), 5 (9-10), 6 (11+)]
    includedSkills, // [string]
    excludedSkills, // [string]
    includedLanguages, // [string]
    excludedLanguages, // [string]
    salaryMin, // string
    companyID, // string
}) => {
    const settingsWithoutRemote = settings.filter(setting => setting !== 'remote')
    const datePostedFilter = {
      ['past-day']: {postedAt: { $gte: moment().subtract(24, 'hours').toDate() }},
      ['past-week']: {postedAt: { $gte: moment().subtract(7, 'day').toDate() }},
      ['past-month']: {postedAt: { $gte: moment().subtract(1, 'month').toDate() }},
    }[datePosted]

    console.log(JSON.stringify(
      {datePostedFilter, presence: !!datePostedFilter}
    , null, 4))

    const filter = {
        $and: [
            datePostedFilter ? datePostedFilter : {},
            employmentTypes.length ? { employmentType: { $in: employmentTypes } } : {},
            settings.includes('remote') || (!settings.length && locations.length) ? { 
                $or: [
                    {setting: 'remote'},
                    { $and: [
                        settingsWithoutRemote.length ? { setting: { $in: settingsWithoutRemote }} : {},
                        locations.length ? { location: { $in: locations }} : {}
                    ]}
                ]} : { 
                    $and: [
                        settings.length ? { setting: { $in: settings }} : {},
                        locations.length ? { location: { $in: locations }} : {}
                ]},
            positions.length ? { position: { $in: positions } } : {},
            experienceLevels.length ? { experienceLevels: { $in: experienceLevels } } : {},
            experienceYears.length ? { experienceYears: { $in: experienceYears } } : {},
            includedLanguages.length ? { languages: { $in: includedLanguages } } : {},
            excludedLanguages.length ? { languages: { $nin: excludedLanguages } } : {},
            includedSkills.length ? { skills: { $in: includedSkills } } : {},
            excludedSkills.length ? { skills: { $nin: excludedSkills } } : {},
            [0, '0'].includes(salaryMin) ? {} : {salaryType: { $nin: 'not-provided' }},
            [0, '0'].includes(salaryMin) ? {} : {estimatedSalaryMax: { $gte: Number(salaryMin)} },
            companyID ? {company: companyID} : {},
        ]
    }

    return removeEmptyObjects(filter)
}
module.exports = {
    generateMongoFilterFromJobFilters
}
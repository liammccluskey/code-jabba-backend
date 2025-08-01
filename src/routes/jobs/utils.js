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
    types, // [internship | part-time | contract | full-time]
    settings, // [on-site | hybrid | remote]
    positions, // [frontend | backend | full-stack | embedded | qa | test]
    locations, // [string]
    experienceLevels, // [entry | mid | senior | staff | principal]
    experienceYears, // [0, 1 (1-2), 2 (3-4), 3 (5-6), 4 (7-8), 5 (9-10), 6 (11+)]
    includedSkills, // [string]
    excludedSkills, // [string]
    includedLanguages, // [string]
    excludedLanguages, // [string]
}) => {
    const filter = {
        $and: [
            types.length ? { type: { $in: types } } : {},
            settings.includes('remote') ? { 
                $or: [
                    {setting: 'remote'},
                    { $and: [
                        settings.length ? { setting: { $in: settings.filter(setting => setting !== 'remote') }} : {},
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
        ]
    }

    //return removeEmptyObjects(filter)
    return filter
}
module.exports = {
    generateMongoFilterFromJobFilters
}
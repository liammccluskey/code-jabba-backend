const {capitalizeWords} = require('../../utils/misc')

const transformCompany = (company, recruiterID=null) => {
    if (recruiterID) {
        company.recruiters = [recruiterID]
        company.admins = [recruiterID]
    }

    company.name = capitalizeWords(company.name)

    return company
}

module.exports = {
    transformCompany
}
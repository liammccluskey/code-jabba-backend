const FRONTEND_EVENTS = {
    landingPageVisit: 'Landing page vist',
}

const BACKEND_EVENTS = {
    // Account create/delete
    candidateSignup: 'Candidate signup',
    recruiterSignup: 'Recruiter signup',
    candidateDeleteAccount: 'Candidate delete account',
    recruiterDeleteAccount: 'Recruiter delete account',

    // Subscription 
    // candidatePremiumSignup: 'Candidate premium signup',
    // candidatePremiumCancellation: 'Candidate cancelled premium',
    recruiterPremiumSignup: 'Recruiter Premium signup',
    recruiterPremiumCancellation: 'Recruiter Premium cancellation',
}

const EVENTS = {
    ...FRONTEND_EVENTS,
    ...BACKEND_EVENTS
}

module.exports = {
    EVENTS
}
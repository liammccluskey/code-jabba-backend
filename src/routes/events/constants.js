const FRONTEND_EVENTS = {
    landingPageVisit: 'Landing page vist',
}

const BACKEND_EVENTS = {
    candidateSignup: 'Candidate signup',
    recruiterSignup: 'Recruiter signup',
    candidateReferralSignup: 'Candidate referral signup',
    recruiterReferralSignup: 'Recruiter referral signup',
    candidateNonReferralSignup: 'Candidate non-referral signup',
    recruiterNonReferralSignup: 'Recruiter non-referral signup',
    candidateDeleteAccount: 'Candidate delete account',
    recruiterDeleteAccount: 'Recruiter delete account',
    candidatePremiumSignup: 'Candidate premium signup',
    recruiterPremiumSignup: 'Recruiter premium signup',
    candidateReferralPremiumSignup: 'Candidate referral premium signup',
    recruiterReferralPremiumSignup: 'Recruiter referral premium signup',
    candidateNonReferralPremiumSignup: 'Candidate non-referral premium signup',
    recruiterNonReferralPremiumSignup: 'Recruiter non-referral premium signup',
    candidateCancelledPremium: 'Candidate cancelled premium',
    recruiterCancelledPremium: 'Recruiter cancelled premium',
}

const EVENTS = {
    ...FRONTEND_EVENTS,
    ...BACKEND_EVENTS
}

module.exports = {
    EVENTS
}
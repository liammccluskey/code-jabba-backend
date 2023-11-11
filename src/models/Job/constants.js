const HOURS_PER_WEEK = 40
const WORK_WEEKS_PER_YEAR = 49
const EXPERIENCE_LEVELS = [
    {id: 'entry', title: 'Entry'},
    {id: 'mid', title: 'Mid'},
    {id: 'senior', title: 'Senior'},
    {id: 'staff', title: 'Staff'},
    {id: 'principal', title: 'Principal'}
]
const EXPERIENCE_YEARS = [
    {id: '0', title: 'None'},
    {id: '1', title: '1-2'},
    {id: '2', title: '3-4'},
    {id: '3', title: '5-6'},
    {id: '4', title: '7-8'},
    {id: '5', title: '9-10'},
    {id: '6', title: '11+'},
]

module.exports = {
    HOURS_PER_WEEK,
    WORK_WEEKS_PER_YEAR,
    EXPERIENCE_LEVELS,
    EXPERIENCE_YEARS
}
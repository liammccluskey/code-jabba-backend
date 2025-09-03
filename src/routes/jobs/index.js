const express = require('express')
const router = express.Router()
const moment = require('moment')
require('dotenv/config')

const Job = require('../../models/Job')
const Application = require('../../models/Application')
const {PAGE_SIZES, MAX_PAGE_SIZE} = require('../../constants')
const {transformJob} = require('../../models/Job/utils')
const {generateMongoFilterFromJobFilters} = require('./utils')
const Company = require('../../models/Company')
const {transformCompany} = require('../../models/Company/utils')
const Subscription = require('../../models/Subscription')
const {SUBSCRIPTION_TIERS} = require('../../models/Subscription/constants')

// GET Routes

router.get('/recruiter-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.jobSearch,
        page,
        userID,
        sortBy,
        archived=undefined,
        title=undefined,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(title ? 
            {
                $text: {
                    $search : title
                }
            } : {}
        ),
        ...(archived ?
            {archived}
            : {}
        ),
        recruiter: userID
    }

    try {
        const count = await Job.countDocuments(filter)
        const jobs = await Job.find(filter)
            .sort(sortBy)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('title archived createdAt')
            .populate('company', 'name')
            .lean()

        res.json({
            jobs,
            pagesCount: Math.ceil(count / pageSize),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/candidate-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.jobSearch,
        page,
        sortBy,
        datePosted='anytime', // anytime | past-day | past-week | past-month
        employmentTypes=[], // internship | part-time | contract | full-time
        settings=[], // on-site | hybrid | remote
        positions=[], // frontend | backend | full-stack | embedded | qa | test
        locations=[], // [string]
        experienceLevels=[], // [entry | mid | senior | staff | principal]
        experienceYears=[], // [0, 1 (1-2), 2 (3-4), 3 (5-6), 4 (7-8), 5 (9-10), 6 (11+)]
        includedSkills=[], // [string]
        excludedSkills=[], // [string]
        includedLanguages=[], // [string]
        excludedLanguages=[], // [string]
        salaryMin='0', // string
        sponsorsVisa=[], // [ visa-yes | visa-no | visa-possibly ]
        requiresClearance='any', // any | clearance-required | clearance-not-required
        companyID=null, // string
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const mongoFilterFromJobFilters = generateMongoFilterFromJobFilters({
        datePosted,
        employmentTypes,
        settings,
        positions,
        locations,
        experienceLevels,
        experienceYears,
        includedSkills,
        excludedSkills,
        includedLanguages,
        excludedLanguages,
        salaryMin,
        sponsorsVisa,
        requiresClearance,
        companyID,
    })

    const filter = {
        archived: false,
        ...mongoFilterFromJobFilters
    }

    try {
        const count = await Job.countDocuments(filter)
        const jobs = await Job.find(filter)
            .sort(sortBy)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('')
            .populate('company', 'name')
            .populate('recruiter', 'displayName')
            .lean()

        res.json({
            jobs,
            pagesCount: Math.ceil(count / pageSize),
            count,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/:jobID', async (req, res) => {
    const {jobID} = req.params
    const {userID} = req.query

    const applicationFilter = {
        job: jobID,
        candidate: userID
    }

    try {
        const job = await Job.findById(jobID)
            .populate('company', 'name rating reviewCount')
            .populate('recruiter', 'displayName')
            .lean()

        const userApplicationsCount = await Application.countDocuments(applicationFilter)
        const totalApplicationsCount = await Application.countDocuments({job: jobID})

        if (job) {
            job.applied = userApplicationsCount > 0
            job.applicationsCount = totalApplicationsCount
            res.json(job)
        } else {
            throw new Error('No jobs matched those filters.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'No jobs matched those filters.'})
    }
})

// POST Routes
router.post('/', async (req, res) => {
    const {userID, job} = req.body

    const subscriptionFilter = {user: userID, status: 'active', tier: SUBSCRIPTION_TIERS.recruiterPremium}
    const jobsFilter = {recruiter: userID, archived: false}

    try {
        const subscriptionsCount = Subscription.countDocuments(subscriptionFilter)
        const activeJobsCount = Job.countDocuments(jobsFilter)

        if (subscriptionsCount == 0 && activeJobsCount >= 1) {
            res.status(403).json({message: 'You must sign up for Recruiter Premium to have more than one active job post at a time.'})
        }
    } catch (error) {
        console.log('Failed to find subscriptions or active jobs')
        res.status(500).json({message: 'Failed to verify ability to post job.'})
    }

    const updatedJob = new Job(transformJob(job, userID, true))

    try {
        await updatedJob.save()

        res.json({
            message: `Successfully created job ${job.title}.`,
            jobID: updatedJob._id
        })

        try {
            await Company.updateOne({_id: job.company._id}, {
                $addToSet: {recruiters: userID}
            })
        } catch (error) {
            console.log(error)
        }
    } catch (error) {   
        console.log(error)
        res.status(500).json({message: error.message})
    }   
})

router.post('/job-post-service', async (req, res) => {
    const {job} = req.body
    const {companyName} = job

    const companyFilter = {
        $text: {
            $search : companyName
        }
    }
    let companyID = null
    const recruiterID = process.env.MY_MONGO_USER_ID

    if (!companyName) {
        console.log('No company name provided')
        res.status(400).json({message: 'Error: You did not provide a company name.'})
        return
    }

    // find companyID, create new company if it doesn't exist
    try {
        const [company=null] = await Company.find(companyFilter)
            .select('_id')
            .lean()

        if (company) {
            companyID = company._id

            try {
                await Company.updateOne({_id: companyID}, {
                    $addToSet: {recruiters: recruiterID}
                })
            } catch (error) {
                console.log('Failed to add recruiter to company recruiters.')
                console.log(error)
            }
        } else {
            const company = new Company(transformCompany({name: companyName}, recruiterID))
            await company.save()

            companyID = company._id
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to create/find company.'})
        return
    }

    delete job.companyName
    job.company = companyID
    const updatedJob = new Job(transformJob(job, recruiterID, true))

    // check if job already exists
    const jobFilter = {
        company: companyID,
        title: job.title,
        location: job.location,
        archived: false
    }

    try {
        const jobsCount = await Job.countDocuments(jobFilter)

        if (jobsCount >= 1) {
            res.status(400).json({message: "The job you're trying to create already exists."})
            return
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Unable to verify whether job already exists.'})
    }

    // create and save job
    try {
        await updatedJob.save()

        res.status(201).json({message: `Successfully created job ${job.title}.`})

        try {
            await Company.updateOne({_id: companyID}, {
                $addToSet: {recruiters: recruiterID}
            })
        } catch (error) {
            console.log(error)
        }
    } catch (error) {   
        console.log(error)
        res.status(400).json({message: error.message})
    }   
})

router.patch('/repost/:jobID', async (req, res) => {
    const {jobID} = req.params
    const {userID} = req.body

    const updatedFields = {
        postedAt: moment().toISOString(),
        archived: false,
    }

    try {
        let job = await Job.findById(jobID)
            .lean()

        if (!job) {
            res.status(400).json({message: 'No jobs matched those filters'})
            return
        } else if (job.recruiter != userID) {
            res.status(403).json({message: 'You do not have access to make edits on this job.'})
            return
        }
        await Job.updateOne({_id: jobID, updatedFields})

        res.json({message: 'Successfully reposted job.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'No jobs matched those filters.'})
    }
})

// PATCH Routes
router.patch('/job-archive-service', async (req, res) => {
    const jobFilter = {
        postedAt: { $lte: moment().subtract(1, 'month').toDate()},
        archive: true,
    }

    try {
        const jobsToArchiveCount = await Job.countDocuments(jobFilter)

        await Job.updateMany(jobFilter, {archived: true})

        res.json({message: `Successfully archived ${jobsToArchiveCount} jobs.`})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.patch('/:jobID', async (req, res) => {
    const {updatedFields, userID} = req.body
    const {jobID} = req.params

    const updatedJob = transformJob(updatedFields)

    try {
        const job = await Job.findById(jobID)
            .lean()

        if (job.recruiter != userID) {
            res.status(403).json({message: 'You do not have access to make edits on this job.'})
            return
        }

        await Job.findByIdAndUpdate(jobID, {
            $set: updatedJob
        })

        res.json({message: 'Successfully updated job.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router

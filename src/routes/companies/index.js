const express = require('express')
const router = express.Router()

const Company = require('../../models/Company')
const {PAGE_SIZES, MAX_PAGE_SIZE} = require('../../constants')
const {transformCompany} = require('../../models/Company/utils')

// GET Routes
/*
    - required query fields:
        - page
        - name
    - optional query fields:
        - pagesize
*/
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.companySearch,
        page,
        name
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        $text: {
            $search : name
        }
    }

    try {
        const count = await Company.countDocuments(filter)
        const companies = await Company.find(filter)
            .sort({name: 1})
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('name')
            .lean()

        res.json({
            companies,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// GET Routes
/*
    - required query fields:
        - page
        - userID
    - optional query fields:
        - pagesize
        - name
        - isAdmin
*/
router.get('/recruiter-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.companySearch,
        page,
        userID,
        isAdmin=undefined,
        name=undefined,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(name ? 
            {
                $text: {
                    $search : name
                }
            } : {}
        ),
        ...(isAdmin ?
            {admins: userID}
            : {}
        ),
        ...(isAdmin === null ?
            {
                $or: [
                    {admins: userID},
                    {recruiters: userID},
                ]
            } : {}
        )
    }

    try {
        const count = await Company.countDocuments(filter)
        const companies = await Company.find(filter)
            .sort({name: 1})
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('name admins recruiters')
            .lean()

        res.json({
            companies,
            pagesCount: Math.ceil(count / pageSize),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/:companyID', async (req, res) => {
    const {companyID} = req.params 

    try {
        const company = await Company.findById(companyID)
            .lean()

        if (company) {
            res.json(company)
        } else {
            throw new Error('No companies matched those filters.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'No companies matched those filters.'})
    }
})

// POST Routes
router.post('/', async (req, res) => {
    const {userID, company} = req.body
    const updatedCompany = new Company(transformCompany(company, userID))

    try {
        await updatedCompany.save()

        res.json({
            message: `Successfully created company ${updatedCompany.name}.`,
            companyID: updatedCompany._id
        })
    } catch (error) {   
        console.log(error)
        res.status(500).json({message: error.message})
    }   
})

// PATCH Routes
router.patch('/:companyID', async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router

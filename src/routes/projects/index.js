const express = require('express')
const router = express.Router()

const AccessCode = require('../../models/AccessCode')
const Project = require('../../models/Project')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')
const {APP_NOTIFICATIONS} = require('./notifications')

// GET Routes

//  get a user's projects
//  required query fields
//      - page
//      - sortby
//  optional query fields
//      - pagesize
router.get('/search', async (req, res) => {
    const {
        page,
        sortby,
        pagesize = PAGE_SIZES.projects,
        archived,
        status=null,
        projectName=null,
        receivedPayment=null,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)
    const filter = {
        archived,
        ...(!!status ? {status} : {}),
        ...(!!projectName ? {
            $text: {
                $search: projectName
            }
        }: {}),
        ...(receivedPayment !== null ? {receivedPayment} : {}),
    }

    try {
        const count = await Project.countDocuments(filter)
        const projects = await Project.find(filter)
            .sort(sortby)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .populate('creator', 'displayName')
            .lean()
            
        res.json({
            thisUserProjects: projects,
            canLoadMore: projects.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/:projectID', async (req, res) => {
    const {projectID} = req.params

    try {
        const project = await Project.findById(projectID)
            .populate('creator', 'displayName photoURL email')
            .lean()

        if (!project.creator) {
            project.creator = {
                displayName: 'User Deleted',
                email: 'User Deleted',
            }
        }

        if (project) {
            res.json(project)
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const project = new Project(req.body)

    try {
        let receivedPayment = false
        if (req.body.accessCode) {
            const filter = {
                code: req.body.accessCode,
                claimed: false
            }
            
            const accessCode = await AccessCode.find(filter)

            if (accessCode) {
                receivedPayment = true
                project.receivedPayment = true

                await AccessCode.findOneAndUpdate(filter, {claimed: true})
            } else {
                throw Error('Access code is invalid.')
            }
        }

        await project.save()

        res.json({
            message: 'Project created.',
            projectID: project._id
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/:projectID', async (req, res) => {
    const {projectID} = req.params
    const updatedFields = req.body
    const filter = {_id: projectID}

    try {
        const project = await Project.findOneAndUpdate(filter, updatedFields)
            .lean()

        if (project) {
            res.json({message: 'Successfully updated project.'})
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/:projectID', async (req, res) => {
    const {projectID} = req.params
    const filter = {_id: projectID}

    try {
        const project = await Project.findOneAndDelete(filter)
            .lean()

        if (project) {
            res.json({message: 'Project deleted.'})
        } else {
            throw Error('No projects matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router
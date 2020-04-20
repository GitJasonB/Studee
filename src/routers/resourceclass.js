const express = require('express')
const ResourceClass = require('../models/resourceclass')

// provides CRUD operations for the resourceclass resource

const router = new express.Router()

/*
Creatrion endpoint, a non-referential integrity version that allows for
a child to be created without a valid parent which may be a valid thing to do. 

Code could also be offered to check for a valid parent, and prevent it where the DB
is non-referential
*/

router.post('/classes', async (req, res) => {

    console.log('resource classes', req.body)
    const resourceClass = new ResourceClass(req.body)

    try {
        await resourceClass.save()
        res.status(201).send({ resourceClass })
    } catch (e) {
        res.status(400).send(e)
    }
}) 

/* singular record retrieval endpoint, pulls back 1 layer of children too, could be modified to retriev n level depths of children if needed */

router.get('/classes/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const resClass = await ResourceClass.findOne({ resourceclassId : _id })

        if (!resClass) {
            return res.status(404).send()
        }

        await resClass.populate({path : 'commodities'}).execPopulate()

        res.send({class:resClass, classcommodities : resClass.commodities})
    } catch (e) {
        res.status(500).send()
    }
})

/* all classes retrieval endpoint, no children but could be modified to retrieve n level depths of children if needed */
// GET /classes/?sortBy=name&limit=3&skip=3 /* 3 records returned, skipping a single 'page', ie 2nd page

router.get('/classes', async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        // retrieve classes with an options object (find)
        const resClasses = await ResourceClass.find(
            {}, null,
            {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip),
              sort
            }
        )

        if (resClasses.length === 0) {
            return res.status(404).send()
        }

        res.send(resClasses)
    } catch (e) {
        res.status(500).send()
    }
})

/* update endpoint - this version will allow a resourceclassowner field that doesn't exist to be specified, code can be offered in an   
alternate version that checks for a valid parent before allowing the insert */

router.patch('/classes/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['resourceclassId', 'name', 'resourceclassowner']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!, please check fields you are supplying to update' })
    }

    try {
        const resClass = await ResourceClass.findOne({ resourceclassId: req.params.id })

        if (!resClass) {
            return res.status(404).send()
        }

        updates.forEach((update) => resClass[update] = req.body[update])
        await resClass.save()
        res.send(resClass)
    } catch (e) {
        res.status(400).send(e)
    }
})


/*
Deletion endpoint. 

This version may leave children with no parents, which may be valid, but alternative versions could be written 
which either remove all children or refuse to remove a resource which would result in orphans (unless the resource is at the bottom of the tree)

*/

router.delete('/classes/:id', async (req, res) => {
    try {
        const resClass = await ResourceClass.findOneAndDelete({ resourceclassId: req.params.id })

        if (!resClass) {
            res.status(404).send()
        }

        res.send(resClass)
    } catch (e) {
        res.status(500).send()
    }
}) 
module.exports = router
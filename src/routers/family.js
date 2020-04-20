const express = require('express')
const Family = require('../models/family')

// provides CRUD operations for the family resource

const router = new express.Router()

/*
Creatrion endpoint, a non-referential integrity version that allows for
a child to be created without a valid parent which may be a valid thing to do. 

Code could also be offered to check for a valid parent, and prevent it where the DB
is non-referential
*/

router.post('/families', async (req, res) => {

    console.log('family', req.body)
    const family = new Family(req.body)

    try {
        await family.save()
        res.status(201).send({ family })
    } catch (e) {
        res.status(400).send(e)
    }
}) 

/* singular record retrieval endpoint, pulls back 1 layer of children too, could be modified to retriev n level depths of children if needed */

router.get('/families/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const family = await Family.findOne({ familyId : _id })

        if (!family) {
            return res.status(404).send()
        }

        await family.populate({path : 'resourceclasses'}).execPopulate()

        res.send({family, familyclasses : family.resourceclasses})
    } catch (e) {
        res.status(500).send()
    }
})


/* all families retrieval endpoint, no children but could be modified to retrieve n level depths of children if needed */
// GET /families/?sortBy=name&limit=3&skip=3 /* 3 records returned, skipping a single 'page', ie 2nd page

router.get('/families', async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        // retrieve families with an options object (find)
        const families = await Family.find(
            {}, null,
            {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip),
              sort
            }
        )

        if (families.length === 0) {
            return res.status(404).send()
        }

        res.send(families)
    } catch (e) {
        res.status(500).send()
    }
})

/* update endpoint - this version will allow an familyowner field that doesn't exist to be specified, code can be offered in an   
alternate version that checks for a valid parent before allowing the insert */

router.patch('/families/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['familyId', 'name', 'familyowner']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!, please check fields you are supplying to update' })
    }

    try {
        const family = await Family.findOne({ familyId: req.params.id })

        if (!family) {
            return res.status(404).send()
        }

        updates.forEach((update) => family[update] = req.body[update])
        await family.save()
        res.send(family)
    } catch (e) {
        res.status(400).send(e)
    }
})


/*
Deletion endpoint. 

This version may leave children with no parents, which may be valid, but alternative versions could be written 
which either remove all children or refuse to remove a resource which would result in orphans (unless the resource is at the bottom of the tree)

*/

router.delete('/families/:id', async (req, res) => {
    try {
        const family = await Family.findOneAndDelete({ familyId: req.params.id })

        if (!family) {
            res.status(404).send()
        }

        res.send(family)
    } catch (e) {
        res.status(500).send()
    }
})
 
module.exports = router
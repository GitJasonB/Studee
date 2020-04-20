const express = require('express')
const Segment = require('../models/segment')

// provides CRUD operations for the segment resource

const router = new express.Router()

/*
Creation endpoint, a non-referential integrity version that allows for
a child to be created without a valid parent which may be a valid thing to do. 

Code could also be offered to check for a valid parent, and prevent it where the DB
is non-referential
*/

router.post('/segments', async (req, res) => {

    //console.log('segment', req.body)
    const segment = new Segment(req.body)

    try {
        await segment.save()
        res.status(201).send({ segment })
    } catch (e) {
        res.status(400).send(e)
    }
})


/* singlular record retrieval endpoint, pulls back 1 layer of children too, could be modified to retrieve n level depths of children if needed */

router.get('/segments/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const segment = await Segment.findOne({ segmentId : _id })

        if (!segment) {
            return res.status(404).send()
        }

        await segment.populate({path : 'families'}).execPopulate()

        res.send({segment, segmentfamilies : segment.families})
    } catch (e) {
        res.status(500).send()
    }
})

/* all segments retrieval endpoint, no children but could be modified to retrieve n level depths of children if needed */
// GET /segments/?sortBy=name&limit=3&skip=3 /* 3 records returned, skipping a single 'page', ie 2nd page

router.get('/segments', async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        // retrieve segments with an options object (find)
        const segments = await Segment.find(
            {}, null,
            {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip),
              sort
            }
        )

        if (segments.length === 0) {
            return res.status(404).send()
        }

        res.send(segments)
    } catch (e) {
        res.status(500).send()
    }
})

/* update endpoint */

router.patch('/segments/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['segmentId', 'name']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!, please check fields you are supplying to update' })
    }

    try {
        const segment = await Segment.findOne({ segmentId: req.params.id })

        if (!segment) {
            return res.status(404).send()
        }

        updates.forEach((update) => segment[update] = req.body[update])
        await segment.save()
        res.send(segment)
    } catch (e) {
        res.status(400).send(e)
    }
})


/*
Deletion endpoint. 

This version may leave children with no parents, which may be valid, but alternative versions could be written 
which either remove all children or refuse to remove a resource which would result in orphans (unless the resource is at the bottom of the tree)

*/

router.delete('/segments/:id', async (req, res) => {
    try {
        const segment = await Segment.findOneAndDelete({ segmentId: req.params.id })

        if (!segment) {
            res.status(404).send()
        }

        res.status(200).send(segment)
    } catch (e) {
        res.status(500).send()
    }
})
 
module.exports = router
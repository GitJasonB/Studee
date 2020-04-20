const express = require('express')
const Commodity = require('../models/commodity')

// provides CRUD operations for the commodity resource

const router = new express.Router()

/*
Creatrion endpoint, a non-referential integrity version that allows for
a child to be created without a valid parent which may be a valid thing to do. 

Code could also be offered to check for a valid parent, and prevent it where the DB
is non-referential
*/

router.post('/commodities', async (req, res) => {

    console.log('commodity', req.body)
    const commodity = new Commodity(req.body)

    try {
        await commodity.save()
        res.status(201).send({ commodity })
    } catch (e) {
        res.status(400).send(e)
    }
}) 

/* singular record retrieval endpoint, pulls back 1 layer of children too, could be modified to retriev n level depths of children if needed */

router.get('/commodities/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const commodity = await Commodity.findOne({ commodityId : _id })

        if (!commodity) {
            return res.status(404).send()
        }

        res.send( commodity )
    } catch (e) {
        res.status(500).send()
    }
})

/* all commodities retrieval endpoint, no children but could be modified to retrieve n level depths of children if needed */
// GET /commodities/?sortBy=name&limit=3&skip=3 /* 3 records returned, skipping a single 'page', ie 2nd page

router.get('/commodities', async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        // retrieve commodities with an options object (find)
        const commodities = await Commodity.find(
            {}, null,
            {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip),
              sort
            }
        )

        if (commodities.length === 0) {
            return res.status(404).send()
        }

        res.send(commodities)
    } catch (e) {
        res.status(500).send()
    }
})

/* update endpoint - this version will allow a commodityowner field that doesn't exist to be specified, code can be offered in an   
alternate version that checks for a valid parent before allowing the insert */

router.patch('/commodities/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['commodityId', 'name', 'commodityowner']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!, please check fields you are supplying to update' })
    }

    try {
        const commodity = await Commodity.findOne({ commodityId: req.params.id })

        if (!commodity) {
            return res.status(404).send()
        }

        updates.forEach((update) => commodity[update] = req.body[update])
        await commodity.save()
        res.send(commodity)
    } catch (e) {
        res.status(400).send(e)
    }
})


/*
Deletion endpoint. 

This version may leave children with no parents, which may be valid, but alternative versions could be written 
which either remove all children or refuse to remove a resource which would result in orphans (unless the resource is at the bottom of the tree)

*/

router.delete('/commodities/:id', async (req, res) => {
    try {
        const commodity = await Commodity.findOneAndDelete({ commodityId: req.params.id })

        if (!commodity) {
            res.status(404).send()
        }

        res.send(commodity)
    } catch (e) {
        res.status(500).send()
    }
})
 
module.exports = router
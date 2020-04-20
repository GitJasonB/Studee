const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const segmentRouter = require('./routers/segment')
const familyRouter = require('./routers/family')
const resourceClassRouter = require('./routers/resourceclass')
const commodityRouter = require('./routers/commodity')


const app = express()

app.use(express.json())

app.use(userRouter)
app.use(segmentRouter)
app.use(familyRouter)
app.use(resourceClassRouter)
app.use(commodityRouter) 

module.exports = app
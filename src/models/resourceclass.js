const mongoose = require('mongoose')



const resourceClassSchema = new mongoose.Schema({
    resourceclassId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    resourceclassowner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Family'
    }
}, {
    timestamps: true
})

resourceClassSchema.virtual('commodities', {
    ref: 'Commodity',
    localField: '_id',
    foreignField: 'commodityowner'
})




const ResourceClass = mongoose.model('ResourceClass', resourceClassSchema)

module.exports = ResourceClass
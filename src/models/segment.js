const mongoose = require('mongoose')



const segmentSchema = new mongoose.Schema({
    segmentId: {
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    }
}, {
    timestamps: true
})

segmentSchema.virtual('families', {
    ref: 'Family',
    localField: '_id',
    foreignField: 'familyowner'
})  



const Segment = mongoose.model('Segment', segmentSchema)

module.exports = Segment
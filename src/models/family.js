const mongoose = require('mongoose')


const familySchema = new mongoose.Schema({
    familyId: {
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
    familyowner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Segment'
    }
}, {
    timestamps: true
})

familySchema.virtual('resourceclasses', {
    ref: 'ResourceClass',
    localField: '_id',
    foreignField: 'resourceclassowner'
})


const Family = mongoose.model('Family', familySchema)

module.exports = Family
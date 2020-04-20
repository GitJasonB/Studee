const mongoose = require('mongoose')

const commoditySchema = new mongoose.Schema({
    commodityId: {
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
    commodityowner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ResourceClass'
    }
}, {
    timestamps: true
})

const Commodity = mongoose.model('Commodity', commoditySchema)

module.exports = Commodity
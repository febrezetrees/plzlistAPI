const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose) //NB: no longer maintained. No compatibble with mongoose v7+

const itemSchema = new mongoose.Schema(
    // Base information
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, //Linked to 'User' ObjectId via 'ref' property below. ObjectId number will come from front-end req via 'user' const
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },

    // Options
    {
        timestamps: true
    }
)

itemSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Item', itemSchema)
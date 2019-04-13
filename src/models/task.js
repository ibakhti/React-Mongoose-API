const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({ // Create schema for model
    description: {
        type: String, // Type of data
        required: true, // Client has to provide desc params
        trim: true, // Remove space before and after dara you wanna input
        validate(value) {
            if(!isNaN(parseInt(value))) { // if the incoming value is numbers
                throw new Error("description cannot be numbers, seriously ?")
            }

        }
    },
    completed: {
        type: Boolean,
        default: false // Default value if not provided
    },
    owner : { // Foreign field to _id field in Users collection
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true // Auto generate the field and value for createdAt and updatedAt
})

const Task = mongoose.model('Task', taskSchema )

module.exports = Task
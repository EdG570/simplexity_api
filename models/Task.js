const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    taskListId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'TaskList'
    }
})

const Task = mongoose.model('Task', taskSchema)

function validate(body) {
    const schema = { 
        name: Joi.string().required().min(2).max(100),
        taskListId: Joi.string()
    }

    return Joi.validate(body, schema);
}

module.exports.Task = Task
module.exports.validate = validate
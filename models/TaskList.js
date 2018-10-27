const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')

const taskListSchema = new Schema({
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
    isHidden: {
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
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }]
})

const TaskList = mongoose.model('TaskList', taskListSchema)

function validate(body) {
    const schema = { 
        name: Joi.string().required().min(2).max(100),
        isHidden: Joi.boolean()
    }

    return Joi.validate(body, schema);
}

module.exports.TaskList = TaskList
module.exports.validate = validate
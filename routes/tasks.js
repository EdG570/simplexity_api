const express = require('express')
const router = express.Router()
const { Task, validate } = require('../models/Task')
const { User } = require('../models/User')
const { TaskList } = require('../models/TaskList')
const mongoose = require('mongoose')
const debugRoute = require('debug')('Express:Route')
const debugQuery = require('debug')('Database:Query')
const auth = require('../middleware/auth')
const asyncMiddleware = require('../middleware/async')

router.get('/all/:id', auth, asyncMiddleware(async (req, res) => {
    const listId = req.params.id

    debugRoute('LIST ID: ' + listId)
    
    const taskList = await TaskList.findById(listId).populate({ path: 'tasks' })
    if (!taskList) return res.status(404).send('Unable to find any tasks')

    res.status(200).send(taskList)
}))

router.get('/:id', auth, asyncMiddleware(async (req, res) => {
    const id = req.params.id

    const task = await Task.findById(id)
    if (!task) return res.status(404).send('Unable to find task list')

    res.status(200).send(task)
}))

// Create new
router.post('/', auth, asyncMiddleware(async (req, res) => {
    const id = req.user._id
    const taskListId = req.body.taskListId

    let taskList = await TaskList.findOne({ "_id": taskListId }).populate('tasks')
    if (!taskList) return res.status(400).send('Task list not found')

    const { error } = validate(req.body)
    if (error) return res.status(400).send({ error: error.details[0].message })

    task = new Task({ name: req.body.name, taskListId })
    await task.save()

    debugQuery(task)

    taskList.tasks.push(task)
    await taskList.save()

    res.status(200).send(task)
}))

// Flag completed
router.post('/completed/:id', auth, asyncMiddleware(async (req, res) => {
    const id = req.params.id

    const task = await Task.findById(id)
    if (!task) return res.status(400).send('Task was not found')

    task.isCompleted = true
    await task.save()

    res.status(200).send(task)
}))

module.exports = router
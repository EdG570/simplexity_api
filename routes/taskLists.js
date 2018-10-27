const express = require('express')
const router = express.Router()
const { TaskList, validate } = require('../models/TaskList')
const { User } = require('../models/User')
const { Task } = require('../models/Task')
const mongoose = require('mongoose')
const debugRoute = require('debug')('Express:Route')
const debugQuery = require('debug')('Express:Query')
const auth = require('../middleware/auth')
const asyncMiddleware = require('../middleware/async')

// Get All task lists
router.get('/', auth, asyncMiddleware(async (req, res) => {
    const id = req.user._id
    
    const taskLists = await User.findById(id).populate({ path: 'taskLists', isCompleted: false })
    if (!taskLists) return res.status(404).send('Unable to find any task lists')

    res.status(200).send(taskLists.taskLists)
}))

// Get one by id
router.get('/:id', auth, asyncMiddleware(async (req, res) => {
    const id = req.params.id

    const taskList = await TaskList.findById(id).populate({ path: 'tasks' })
    if (!taskList) return res.status(404).send('Unable to find task list')

    res.status(200).send(taskList)
}))

// Create new
router.post('/', auth, asyncMiddleware(async (req, res) => {
    const id = req.user._id

    debugRoute(`UserId: ${ id }, Request Body: ${ req.body.name }`)

    let user = await User.findById(id).populate({ path: 'taskLists', name: req.body.name })
    if (user.taskLists.length > 0) { 
        let target = user.taskLists.filter(taskList => {
            return taskList.name == req.body.name
        })
        if (target.length > 0) {
            debugRoute(target)
            return res.status(400).send('Task list already exists')
        }    
    }

    const { error } = validate(req.body)
    if (error) return res.status(400).send({ error: error.details[0].message })

    let list = new TaskList ({ name: req.body.name, userId: id, isHidden: req.body.isHidden })
    await list.save()

    user.taskLists.push(list)
    await user.save()

    res.status(200).send(list)
}))

// Flag completed
router.post('/completed/:id', auth, asyncMiddleware(async (req, res) => {
    const listId = req.params.id

    const list = await TaskList.findById(listId)
    if (!list) return res.status(400).send('Task list was not found')

    list.isCompleted = true
    await list.save()

    res.status(200).send(list)
}))

router.delete('/', auth, asyncMiddleware(async (req, res) => {
    const listId = req.body.listId
    const userId = req.user._id

    let user = await User.findById(userId)
    if (!user) return res.status(400).send('Unable to find user')

    user.taskLists.pull(listId)
    user.save()

    let list = await TaskList.findById(listId)

    await Task.remove({ _id: { $in: list.tasks } })

    let removedList = await TaskList.findByIdAndRemove(listId)
    if (!removedList) return res.status(400).send('Unable to delete list')

    res.status(200).send(removedList)
}))

module.exports = router
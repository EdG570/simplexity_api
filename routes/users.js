const express = require('express')
const router = express.Router()
const { User, validate } = require('../models/User')
const mongoose = require('mongoose')
const debugRoute = require('debug')('Express:Route')
const debugQuery = require('debug')('Express:Query')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const asyncMiddleware = require('../middleware/async')

router.get('/me', auth, asyncMiddleware(async (req, res) => {
    const id = req.user._id;
    let user = await User.findById(id).select('-password')
    res.send(user)
}))

router.post('/', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) res.status(400).send({ error: error.details[0].message })

    let user = await User.findOne({  username: req.body.email })
    if (user) return res.status(400).send('User already exists')

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.password, salt)

    user = new User ({
        email: req.body.email,
        password: hash,
        pin: null
    })

    await user.save()

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    res.header('x-auth-token', token).send({
        email: user.email
    })
}))

router.put('/pin', auth, asyncMiddleware(async (req, res) => {
    const id = req.user._id
    
    let user = await User.findById(id)
    if (!user) return res.status(400).send('Unable to find user')

    user.pin = req.body.pin
    await user.save()

    res.status(200).send(user)
}))

module.exports = router
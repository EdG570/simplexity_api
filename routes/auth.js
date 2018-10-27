const express = require('express')
const router = express.Router()
const { User, validate } = require('../models/User')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const asyncMiddleware = require('../middleware/async')
const debug = require('debug')('App')

router.post('/', asyncMiddleware(async (req, res, next) => {
    const { error } = validate(req.body)
    if (error) res.status(400).send({ error: error.details[0].message })

    let user = await User.findOne({  email: req.body.email })
    if (!user) return res.status(400).send('Invalid Username')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid Password')

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    res.header('x-auth-token', token).send({
        email: user.email
    })        
}))

module.exports = router
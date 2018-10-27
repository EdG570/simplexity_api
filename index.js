const express = require('express');
const debug = require('debug')('Express:Connection')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const config = require('./config/config')
const error = require('./middleware/error')
const winston = require('winston')
const db = require('./db/db')()

const app = express()

winston.add(winston.transports.File, { filename: 'logfile.log' })

// Routes
const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const taskListRoutes = require('./routes/taskLists')
const taskRoutes = require('./routes/tasks')

// Middleware
app.use(cors({ exposedHeaders: 'x-auth-token'}))
app.use(helmet())
app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/lists', taskListRoutes)
app.use('/api/tasks', taskRoutes)

app.use(error)

// Express Connection

const port = config.app.port || 3000

app.listen(port, () => { 
    console.log(process.env.DEV_DB_HOST)
    debug(`Express is listening on port: ${ port }`)
    debug(`Currently working in the ${ process.env.NODE_ENV } environment...`)
})


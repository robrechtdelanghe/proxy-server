const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const debug = require('debug')('proxy-server:index')
const admin = require('./proxy-server-admin')
const client = require('./proxy-server-client')
const executor = require('./proxy-server-executor')
const passthrough = require('./proxy-server-passthrough')

debug.enabled = true

debug('Create express app')
const app = express()

debug('Add middleware')
app.use(logger('dev'))
app.use(cors())

let executorResContainer = {}
let clientResContainer = {}

app.use('/admin', admin(executorResContainer, clientResContainer))
app.use('/client', client(executorResContainer, clientResContainer))
app.use('/executor', executor(executorResContainer, clientResContainer))
if (process.env.BASE_URL) {
  app.use('/*', passthrough())
}

debug('Add 404 handler')
app.use((req, res) => {
  res.status(404).send(`Page "${req.url}" not found`)
})

const port = process.env.PORT || 3000
app.listen(port, () => { debug(`Started listening on port ${port}`) })

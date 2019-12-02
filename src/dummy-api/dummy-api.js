const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const debug = require('debug')('dummy-api')

debug('Create dummy api')
const app = express()

debug('Add middleware')
app.use(logger('dev'))
app.use(cors())

app.get('/text/success', (req, res) => {
  res.status(200)
  res.set('Content-Type', 'text/plain')
  res.send('All good')
})
app.get('/text/error', (req, res) => {
  res.status(500)
  res.set('Content-Type', 'text/plain')
  res.send('Internal server error')
})
app.get('/html/success', (req, res) => {
  res.status(200)
  res.set('Content-Type', 'text/html')
  res.send('<h1>All good</h1>')
})
app.get('/html/error', (req, res) => {
  res.status(500)
  res.set('Content-Type', 'text/html')
  res.send('<h1>Internal server error</h1>')
})
app.get('/json/success', (req, res) => {
  res.status(200)
  res.json({
    result: 'good'
  })
})
app.get('/json/error', (req, res) => {
  res.status(400)
  res.json({
    result: 'bad'
  })
})

const port = process.env.PORT || 3003

app.listen(port, () => { debug(`Started listening on port ${port}`) })

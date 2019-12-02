const express = require('express')
const debug = require('debug')('proxy-server:admin')

const admin = (executorResContainer, clientResContainer) => {
  const app = express()

  app.get('/clear', (req, res) => {
    executorResContainer = {}
    clientResContainer = {}
    res.send('Cleared')
  })

  app.get('/info', (req, res) => {
    res.send(
      `Number of executors: ${Object.keys(executorResContainer).length}
     Number of clients: ${Object.keys(clientResContainer).length}`
    )
  })

  debug('Admin created')
  return app
}

module.exports = admin

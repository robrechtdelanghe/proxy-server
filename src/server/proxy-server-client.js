const express = require('express')
const debug = require('debug')('proxy-server:client')

const client = (executorResContainer, clientResContainer) => {
  const app = express()

  const hasFreeExecutors = () => {
    return getNextExecutor() !== undefined
  }
  const getNextExecutor = () => {
    return Object.entries(executorResContainer)[0]
  }

  const addClientResponse = (client, hash, clientRes) => {
    clientResContainer[client] = clientResContainer[client] || {}
    clientResContainer[client][hash] = clientRes
  }

  const sendMessageToExecutor = (executor, message) => {
    executor.json(message)
  }

  const removeUsedExecutor = (executorId) => {
    delete executorResContainer[executorId]
  }

  app.get('/:client/hash/:hash/url/:url', (req, res) => {
    const client = req.params.client
    const hash = req.params.hash
    const url = req.params.url

    if (hasFreeExecutors()) {
      const [executorId, executorRes] = getNextExecutor()
      addClientResponse(client, hash, res)
      sendMessageToExecutor(executorRes, { client, hash, url })
      removeUsedExecutor(executorId)
    } else {
      res.status(429)
      res.send('No executor available')
    }
  })

  debug('Client created')
  return app
}

module.exports = client

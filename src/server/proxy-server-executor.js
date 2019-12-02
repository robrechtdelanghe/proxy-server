const express = require('express')
const bodyParser = require('body-parser')
const debug = require('debug')('proxy-server:executor')

const executor = (executorResContainer, clientResContainer) => {
  const app = express()
  app.use(bodyParser.json({
    limit: '50mb'
  }))

  const saveExecutorResponse = (executorRes, id) => {
    debug(`Added new executor with ID ${id}`)
    executorResContainer[id] = executorRes
  }

  const addCloseListener = (executorReq, id) => {
    executorReq.on('close', (err) => {
      delete executorResContainer[id]
      debug(`Removed executor with ID ${id} due to a closed connection`)
    })
  }

  const getClientResponse = (client, hash) => {
    return clientResContainer[client][hash]
  }
  const executorHasError = (executorRequest) => {
    return executorRequest.body.proxyExecutorError !== undefined
  }
  const handleExecutorError = (clientResExecution, executorReq) => {
    const error = executorReq.body.proxyExecutorError
    clientResExecution.status(error.status)
    clientResExecution.set(error.headers)
    clientResExecution.send(error.data)
  }

  const handleExecutorSuccess = (clientResExecution, executorReq) => {
    clientResExecution
      .set(executorReq.body.headers)
      .status(executorReq.body.status)
      .send(executorReq.body.data)
  }

  const removeClientResponse = (client, hash) => {
    delete clientResContainer[client][hash]
    if (Object.keys(clientResContainer[client]).length === 0) {
      delete clientResContainer[client]
    }
  }

  app.get('/listening/:id', (req, res) => {
    const id = req.params.id
    saveExecutorResponse(res, id)
    addCloseListener(req, id)
  })

  app.post('/sending/client/:client/hash/:hash', (req, res) => {
    const { client, hash } = req.params

    const clientResExecution = getClientResponse(client, hash)

    executorHasError(req) ?
      handleExecutorError(clientResExecution, req) :
      handleExecutorSuccess(clientResExecution, req)

    removeClientResponse(client, hash)
    res.send('done')
  })

  debug('Executor created')
  return app
}

module.exports = executor

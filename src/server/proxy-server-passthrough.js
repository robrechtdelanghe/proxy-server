const express = require('express')
const debug = require('debug')('proxy-server:passthrough')
const axios = require('axios')
const { sendAxiosToClient } = require('./../utils/http-utils')

const passthrough = () => {
  const app = express()

  const client = axios.create({
    baseURL: process.env.BASE_URL || 'http://localhost:3002'
  })

  app.use('/*', (req, res) => {
    sendAxiosToClient(client.get(req.originalUrl), res)
  })

  debug('Passthrough created')
  return app
}

module.exports = passthrough

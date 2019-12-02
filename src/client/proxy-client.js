const express = require('express')
const axios = require('axios')
const uuidv1 = require('uuid/v1')
const cors = require('cors')
const logger = require('morgan')
const debug = require('debug')('proxy-client:index')
const { sendAxiosToClient } = require('./../utils/http-utils')

debug.enabled = true

const app = express()

debug('Add middleware')
app.use(logger('dev'))
app.use(cors())

const proxyHost = process.env.PROXY_HOST || 'http://localhost:3000'
const newHost = process.env.NEW_HOST || 'https://www.delijn.be'
const clientId = process.env.CLIENT_ID || uuidv1()

const client = axios.create({
  baseURL: `${proxyHost}/client/${clientId}`
})

const getUrl = (path) => {
  return encodeURIComponent(`${newHost}${path}`)
}

app.use('/*', (req, res) => {
  const path = req.originalUrl
  const url = `/hash/${uuidv1()}/url/${getUrl(path)}`
  sendAxiosToClient(client.get(url), res)
})

const port = process.env.PORT || 3001

app.listen(port, () => { debug(`Started listening on port ${port}`) })

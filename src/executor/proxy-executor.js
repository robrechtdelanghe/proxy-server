const axios = require('axios')
const uuidv1 = require('uuid/v1')
const debug = require('debug')('proxy-executor:index')

debug.enabled = true

const proxyHost = process.env.PROXY_HOST || 'http://localhost:3000'

const createExecutorListener = (id = uuidv1()) => {
  debug(`Create new executor listener with id ${id}`)

  startListening(id)
    .then(result => {
      const { client, hash, url } = result.data
      debug(`New incoming request from client ${client} with url ${url} adn hash ${hash}`)
      doExecution(url)
        .then(executionResult => {
          sendResultToProxy(client, hash, executionResult)
        })
        .catch(err => {
          sendErrorToProxy(client, hash, err)
        })

    })
    .catch(err => {
      debug('Error while listening', err)
    })
    .then(() => {
      createExecutorListener()
    })
}

// LISTENING

const startListening = id => {
  return axios
    .get(`${proxyHost}/executor/listening/${id}`)
}

// EXECUTING
const doExecution = (url) => {
  return axios.get(url)
}
const sendResultToProxy = (client, hash, executionResult) => {
  axios.post(`${proxyHost}/executor/sending/client/${client}/hash/${hash}`, {
    status: executionResult.status,
    headers: executionResult.headers,
    data: executionResult.data,
  })
    .then(result => {
      debug(`Sent result to ${client} from request hash ${hash}`)
    })
    .catch(err => {
      console.error(err)
    })
}
const sendErrorToProxy = (client, hash, err) => {
  const errorBody =
    err.response ?
      {
        status: err.response.status,
        headers: err.response.headers,
        data: err.response.data
      } :
      {
        status: 502,
        headers: {
          'Content-type': 'text/plain'
        },
        data: 'Bad Gateway'
      }

  axios.post(`${proxyHost}/executor/sending/client/${client}/hash/${hash}`, {
    proxyExecutorError: errorBody
  })
    .then()
}

for (let i=0; i<(process.env.LISTENER_COUNT || 2); i++) {
  createExecutorListener()
}

const mapAxiosResponseToExpressResponse = (axiosResponse, expressResponse) => {
  expressResponse
    .set(axiosResponse.headers)
    .status(axiosResponse.status)
    .send(axiosResponse.data)
}

const sendAxiosToClient = (axiosCall, clientResponse) => {
  axiosCall
    .then(result => {
      mapAxiosResponseToExpressResponse(result, clientResponse)
    })
    .catch(err => {
      if (err.response) {
        mapAxiosResponseToExpressResponse(err.response, clientResponse)
      } else {
        debug(err)
        clientResponse
          .status(500)
          .send('Bad request')
      }
    })
}

module.exports = {
  mapAxiosResponseToExpressResponse,
  sendAxiosToClient,
}

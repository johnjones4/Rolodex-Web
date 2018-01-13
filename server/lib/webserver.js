const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const routes = require('./routes')

exports.init = () => {
  const app = express()
  app.use(logger('tiny'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.get('/auth/googlecontacts', routes.authorizors.startGoogleContacts)
  app.get('/auth/googlecontacts/callback', routes.authorizors.finishGoogleContacts)

  return app
}

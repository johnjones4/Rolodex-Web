const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const routes = require('./routes')
const {
  jwtSecret
} = require('./consts')
const jwt = require('express-jwt')

const authenticate = jwt({secret: jwtSecret})

exports.init = () => {
  const app = express()

  app.use(logger('tiny'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(express.static('./build'))

  app.post('/api/login', routes.login.login)

  app.get('/auth/googlecontacts', authenticate, routes.authorizors.startGoogleContacts)
  app.get('/auth/googlecontacts/callback', authenticate, routes.authorizors.finishGoogleContacts)

  app.param('contact', routes.contacts.loadContact)
  app.get('/api/contact', authenticate, routes.contacts.getContacts)
  app.post('/api/contact/:contact', authenticate, routes.contacts.saveContact)

  app.param('note', authenticate, routes.notes.loadNote)
  app.put('/api/note', authenticate, routes.notes.saveNote)
  app.post('/api/note/:note', authenticate, routes.notes.saveNote)
  app.delete('/api/note/:note', authenticate, routes.notes.deleteNote)

  app.put('/api/interaction', authenticate, routes.interactions.saveInteraction)

  app.param('config', authenticate, routes.configs.loadConfig)
  app.get('/api/config', authenticate, routes.configs.getConfigs)
  app.put('/api/config', authenticate, routes.configs.saveConfig)
  app.post('/api/config/:config', authenticate, routes.configs.saveConfig)

  app.get('/api/sync', authenticate, routes.sync.checkSync)
  app.post('/api/sync', authenticate, routes.sync.startSync)

  app.post('/api/upload', authenticate, routes.upload.uploadFile)

  return app
}

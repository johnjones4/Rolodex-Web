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
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
  }))
  app.use(express.static('./build'))

  app.param('contact', routes.contacts.loadContact)
  app.param('note', routes.notes.loadNote)
  app.param('config', routes.configs.loadConfig)

  app.post('/api/login', routes.login.login)

  app.get('/auth/googlecontacts', routes.authorizors.startGoogleContacts)
  app.get('/auth/googlecontacts/callback', routes.authorizors.finishGoogleContacts)

  app.get('/api/contact', authenticate, routes.contacts.getContacts)
  app.post('/api/contact/:contact', authenticate, routes.contacts.saveContact)

  app.put('/api/note', authenticate, routes.notes.saveNote)
  app.post('/api/note/:note', authenticate, routes.notes.saveNote)
  app.delete('/api/note/:note', authenticate, routes.notes.deleteNote)

  app.put('/api/interaction', authenticate, routes.interactions.saveInteraction)

  app.get('/api/config', authenticate, routes.configs.getConfigs)
  app.put('/api/config', authenticate, routes.configs.saveConfig)
  app.post('/api/config/:config', authenticate, routes.configs.saveConfig)

  app.get('/api/sync', authenticate, routes.sync.checkSync)
  app.post('/api/sync', authenticate, routes.sync.startSync)

  app.post('/api/upload', authenticate, routes.upload.uploadFile)

  app.get('/api/tag', authenticate, routes.tags.getTags)

  return app
}

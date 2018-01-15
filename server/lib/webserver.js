const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const routes = require('./routes')

// TODO: security
exports.init = () => {
  const app = express()
  app.use(logger('tiny'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.get('/auth/googlecontacts', routes.authorizors.startGoogleContacts)
  app.get('/auth/googlecontacts/callback', routes.authorizors.finishGoogleContacts)

  app.param('contact', routes.contacts.loadContact)
  app.get('/api/contact', routes.contacts.getContacts)
  app.put('/api/contact', routes.contacts.saveContact)
  app.post('/api/contact/:contact', routes.contacts.saveContact)

  app.param('note', routes.contacts.loadNote)
  app.put('/api/note', routes.notes.saveNote)
  app.post('/api/note/:note', routes.notes.saveNote)

  app.param('config', routes.configs.loadConfig)
  app.get('/api/config', routes.configs.getConfigs)
  app.put('/api/config', routes.configs.saveConfig)
  app.post('/api/config/:config', routes.configs.saveConfig)

  return app
}

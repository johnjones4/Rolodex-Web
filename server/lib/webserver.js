const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const routes = require('./routes')

// TODO: security
exports.init = () => {
  const app = express()
  
  app.use(express.static('./build'))
  app.use(logger('tiny'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.get('/auth/googlecontacts', routes.authorizors.startGoogleContacts)
  app.get('/auth/googlecontacts/callback', routes.authorizors.finishGoogleContacts)

  app.param('contact', routes.contacts.loadContact)
  app.get('/api/contact', routes.contacts.getContacts)
  app.post('/api/contact/:contact', routes.contacts.saveContact)

  app.param('note', routes.notes.loadNote)
  app.put('/api/note', routes.notes.saveNote)
  app.post('/api/note/:note', routes.notes.saveNote)
  app.delete('/api/note/:note', routes.notes.deleteNote)

  app.put('/api/interaction', routes.interactions.saveInteraction)

  app.param('config', routes.configs.loadConfig)
  app.get('/api/config', routes.configs.getConfigs)
  app.put('/api/config', routes.configs.saveConfig)
  app.post('/api/config/:config', routes.configs.saveConfig)

  app.get('/api/sync', routes.sync.checkSync)
  app.post('/api/sync', routes.sync.startSync)

  app.post('/api/upload', routes.upload.uploadFile)

  return app
}

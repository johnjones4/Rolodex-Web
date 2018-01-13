const {
  GoogleContactsSyncer
} = require('../syncers')

exports.startGoogleContacts = (req, res, next) => {
  const googleContactsSyncer = new GoogleContactsSyncer()
  res.redirect(googleContactsSyncer.getAuthorizationURL())
}

exports.finishGoogleContacts = (req, res, next) => {
  const googleContactsSyncer = new GoogleContactsSyncer()
  googleContactsSyncer.loadConfig()
    .then(() => {
      return googleContactsSyncer.finalizeAuthorization(req.query.code)
    })
    .then(() => {
      return googleContactsSyncer.saveConfig()
    })
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => next(err))
}

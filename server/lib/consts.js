exports.port = parseInt(process.env.PORT) || 8000

exports.dbPath = process.env.DB_PATH || './database.sqlite'

exports.rootUrl = process.env.ROOT_URL || ((process.env.HTTP || 'http') + '://' + (process.env.HOSTNAME || 'localhost') + (exports.port === 80 ? '' : (':' + exports.port)))

exports.googleContacts = {
  clientId: process.env.GOOGLE_CONTACTS_CLIENTID,
  clientSecret: process.env.GOOGLE_CONTACTS_CLIENT_SECRET,
  redirectURL: exports.rootUrl + '/auth/googlecontacts/callback'
}

exports.interactionTypes = {
  EMAIL_RECEIVED: 'email_received',
  EMAIL_SENT: 'email_sent',
  APPOINTMENT: 'appointment'
}

exports.uploadDir = process.env.UPLOAD_DIR || './files'

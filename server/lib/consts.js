exports.port = parseInt(process.env.PORT) || 8000

exports.dbPath = process.env.DB_PATH || 'postgres://rolodex:rolodex@127.0.0.1:5432/rolodex'

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

exports.jwtSecret = process.env.JWT_SECRET

exports.user = {
  username: process.env.LOGIN_USERNAME,
  password: process.env.LOGIN_PASSWORD
}

exports.sync = {
  schedule: process.env.SYNC_SCHEDULE || '0 0 * * *',
  tz: process.env.SYNC_TZ || 'America/New_York'
}

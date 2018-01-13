exports.port = parseInt(process.env.PORT) || 8000

exports.rootUrl = (process.env.HTTP || 'http') + '://' + (process.env.HOSTNAME || 'localhost') + (exports.port === 80 ? '' : (':' + exports.port))

exports.googleContacts = {
  clientId: process.env.GOOGLE_CONTACTS_CLIENTID,
  clientSecret: process.env.GOOGLE_CONTACTS_CLIENT_SECRET,
  redirectURL: exports.rootUrl + '/auth/googlecontacts/callback'
}

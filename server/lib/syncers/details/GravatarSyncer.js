const DetailSyncer = require('./DetailSyncer')
const crypto = require('crypto')
const request = require('request-promise-native')

class GravatarSyncer extends DetailSyncer {
  isReady () {
    return true
  }

  updateContact (contact) {
    if (contact.emails && contact.emails.length > 0) {
      const outputContact = {
        emails: contact.emails,
        photos: []
      }
      return Promise.all(
        contact.emails
          .filter(email => email && typeof email === 'string')
          .map((email) => {
            const hash = crypto.createHash('md5').update(email).digest('hex')
            const url = 'https://www.gravatar.com/avatar/' + hash + '?d=404&s=400'
            return request(url)
              .then((response) => {
                outputContact.photos.push(url)
              })
              .catch((err) => {
                if (err.statusCode !== 404) {
                  throw err
                }
              })
          })
      )
        .then(() => {
          if (outputContact.photos.length > 0) {
            return outputContact
          }
        })
    } else {
      return Promise.resolve()
    }
  }

  getConfigKeyName () {
    return 'importer_gravatar'
  }
}

module.exports = GravatarSyncer

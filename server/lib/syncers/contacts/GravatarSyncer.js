const ContactsSyncer = require('./ContactsSyncer')
const crypto = require('crypto')
const request = require('request-promise-native')

class GravatarSyncer extends ContactsSyncer {
  isReady () {
    return true
  }

  fetch () {
    const outputContacts = []
    const fetchNextGravatars = (index) => {
      if (index < this.contactsSyncManager.contacts.length) {
        const contact = this.contactsSyncManager.contacts[index]
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
                outputContacts.push(outputContact)
              }
              return fetchNextGravatars(index + 1)
            })
        } else {
          return fetchNextGravatars(index + 1)
        }
      }
    }
    return fetchNextGravatars(0).then(() => outputContacts)
  }

  getConfigKeyName () {
    return 'importer_gravatar'
  }
}

module.exports = GravatarSyncer

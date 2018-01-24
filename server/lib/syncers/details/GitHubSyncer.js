const DetailSyncer = require('./DetailSyncer')
const url = require('url')
const request = require('request-promise-native')

class GitHubSyncer extends DetailSyncer {
  isReady () {
    return true
  }

  updateContact (contact) {
    const gitHubProfileUrls = contact.urls ? contact.urls.filter(url => url.indexOf('github.com') >= 0) : []
    if (gitHubProfileUrls.length > 0) {
      const startEmailsCount = contact.emails.length
      const outputContact = {
        emails: contact.emails,
        photos: [],
        locations: [],
        tags: []
      }
      return Promise.all(
        gitHubProfileUrls.map((urlstr) => {
          const urlObject = url.parse(urlstr)
          if (urlObject) {
            const username = urlObject.path.replace('/', '')
            return request({
              uri: 'https://api.github.com/users/' + username,
              json: true,
              headers: {
                'User-Agent': 'Rolodex 0.0.1'
              }
            })
              .then((profile) => {
                if (profile) {
                  if (profile.avatar_url) {
                    outputContact.photos.push(profile.avatar_url)
                  }
                  if (profile.location) {
                    outputContact.locations.push(profile.location)
                  }
                  if (profile.email) {
                    outputContact.emails.push(profile.email)
                  }
                  outputContact.tags.push('GitHub')
                }
              })
              .catch((error) => {
                if (error.statusCode !== 404) {
                  throw error
                }
              })
          } else {
            return Promise.resolve()
          }
        })
      )
        .then(() => {
          if (startEmailsCount !== outputContact.emails.length || outputContact.photos.length > 0 || outputContact.locations.length > 0 || outputContact.tags.length > 0) {
            return outputContact
          }
        })
    } else {
      return Promise.resolve()
    }
  }

  getConfigKeyName () {
    return 'importer_github'
  }
}

module.exports = GitHubSyncer

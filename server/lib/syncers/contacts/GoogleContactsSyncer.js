const ContactsSyncer = require('./ContactsSyncer')
const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const people = google.people('v1')
const consts = require('../../consts')

class GoogleContactsSyncer extends ContactsSyncer {
  isReady () {
    return super.isReady() && this.config.accessToken
  }

  getOAuthClient () {
    return new OAuth2(
      consts.googleContacts.clientId,
      consts.googleContacts.clientSecret,
      consts.googleContacts.redirectURL
    )
  }

  getAuthorizationURL () {
    return this.getOAuthClient().generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/plus.login'
      ]
    })
  }

  finalizeAuthorization (code) {
    return new Promise((resolve, reject) => {
      this.getOAuthClient().getToken(code, (err, tokens) => {
        if (err) {
          reject(err)
        } else {
          const config = {
            accessToken: tokens.access_token
          }
          if (tokens.refresh_token) {
            config.refreshToken = tokens.refresh_token
          }
          if (tokens.tokenExpiryDate) {
            config.tokenExpiryDate = tokens.expiry_date
          }
          this.setConfigProps(config)
          resolve()
        }
      })
    })
  }

  applyTokensToOAuthClient (client) {
    if (this.config.accessToken) {
      client.credentials = {
        access_token: this.config.accessToken
      }
      if (this.config.refreshToken) {
        client.credentials.refresh_token = this.config.refreshToken
      }
      if (this.config.tokenExpiryDate) {
        client.credentials.expiry_date = this.config.tokenExpiryDate
      }
    } else {
      throw new Error('Tokens not configured')
    }
  }

  fetch () {
    return new Promise((resolve, reject) => {
      const oauth2Client = this.getOAuthClient()
      this.applyTokensToOAuthClient(oauth2Client)
      people.people.connections.list({
        pageSize: 2000,
        personFields: [
          'addresses',
          'emailAddresses',
          'names',
          'organizations',
          'phoneNumbers',
          'photos',
          'urls',
          'memberships'
        ].join(','),
        resourceName: 'people/me',
        auth: oauth2Client
      }, (err, response) => {
        if (err) {
          reject(err)
        } else if (response && response.connections) {
          resolve(response.connections)
        } else {
          throw new Error('Unknown')
        }
      })
    })
      .then((contacts) => {
        if (contacts) {
          return contacts.map((contact) => {
            const object = {
              googleId: contact.resourceName,
              tags: ['Google Contacts']
            }
            if (contact.names && contact.names.length > 0) {
              object.name = contact.names[0].displayName
            }
            if (contact.photos && contact.photos.length > 0) {
              object.photos = contact.photos.map((photo) => photo.url).filter((value) => !(!value) && value.trim().length > 0)
            }
            if (contact.addresses && contact.addresses.length > 0) {
              object.locations = contact.addresses.map((address) => address.formattedValue).filter((value) => !(!value) && value.trim().length > 0)
            }
            if (contact.emailAddresses && contact.emailAddresses.length > 0) {
              object.emails = contact.emailAddresses.map((emailAddress) => emailAddress.value).filter((value) => !(!value) && value.trim().length > 0)
            }
            if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
              object.phoneNumbers = contact.phoneNumbers.map((phoneNumber) => phoneNumber.value).filter((value) => !(!value) && value.trim().length > 0)
            }
            if (contact.urls && contact.urls.length > 0) {
              object.urls = contact.urls.map((url) => url.value).filter((value) => !(!value) && value.trim().length > 0)
            }
            if (contact.organizations && contact.organizations.length > 0) {
              object.positions = contact.organizations.map((organization) => {
                return {
                  organization: organization.name,
                  title: organization.title || null
                }
              }).filter((value) => !(!value.organization) && value.organization.trim().length > 0)
            }
            if (this.contactIsStarred(contact)) {
              object.hidden = false
            }
            return object
          })
        } else {
          return []
        }
      })
  }

  contactIsStarred (contact) {
    if (contact.memberships) {
      return contact.memberships.findIndex((membership) => {
        return membership.contactGroupMembership && membership.contactGroupMembership.contactGroupId === 'starred'
      }) >= 0
    }
    return false
  }

  getConfigKeyName () {
    return 'importer_googlecontacts'
  }
}

module.exports = GoogleContactsSyncer

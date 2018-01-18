const merge = require('deepmerge')
const Contact = require('../../models/Contact')
const Email = require('../../models/Email')
const Phone = require('../../models/Phone')
const URL = require('../../models/URL')
const Position = require('../../models/Position')
const Location = require('../../models/Location')
const Organization = require('../../models/Organization')
const _ = require('lodash')

const SYNC_CONTACTS = ['googleId', 'exchangeId', 'emails', 'name']

class ContactsSyncManager {
  constructor () {
    this.contacts = []
  }

  saveUpdates () {
    const saveNextContact = (index) => {
      if (index < this.contacts.length) {
        const contact = this.contacts[index]
        return this.findContactInDatabase(contact)
          .then((dbContact) => {
            if (dbContact) {
              return dbContact.fetch({
                withRelated: [
                  'emails',
                  'locations',
                  'phoneNumbers',
                  'urls',
                  'positions'
                ]
              })
                .then((dbContact) => {
                  return Promise.all([
                    Promise.all(dbContact.related('emails').map((email) => email.destroy())),
                    dbContact.related('locations').reset(),
                    Promise.all(dbContact.related('phoneNumbers').map((phone) => phone.destroy())),
                    Promise.all(dbContact.related('urls').map((url) => url.destroy())),
                    Promise.all(dbContact.related('positions').map((position) => position.destroy()))
                  ]).then(() => dbContact)
                })
            } else {
              return new Contact({name: contact.name}).save()
            }
          })
          .then((_contact) => {
            console.log('Updating ' + _contact.get('name'))
            return Promise.all(
              _.keys(contact).map((key) => {
                const updateArrayProp = (Klass, valuePropName, index) => {
                  if (index < contact[key].length) {
                    if (contact[key][index] && contact[key][index].trim().length > 0) {
                      return Klass.getOrCreate(contact[key][index], _contact)
                        .then(() => {
                          return updateArrayProp(Klass, valuePropName, index + 1)
                        })
                    } else {
                      return updateArrayProp(Klass, valuePropName, index + 1)
                    }
                  } else {
                    return Promise.resolve()
                  }
                }
                const updateNextLocation = (index) => {
                  if (index < contact.locations.length) {
                    if (contact.locations[index] && contact.locations[index].trim().length > 0) {
                      return Location
                        .getOrCreate(contact.locations[index])
                        .then((location) => _contact.locations().attach([location.get('id')]))
                        .then(() => updateNextLocation(index + 1))
                    } else {
                      return updateNextLocation(index + 1)
                    }
                  } else {
                    return Promise.resolve()
                  }
                }
                const updateNextPosition = (index) => {
                  if (index < contact.positions.length) {
                    if (contact.positions[index].title && contact.positions[index].title.trim().length > 0) {
                      (() => {
                        if (contact.positions[index].organization) {
                          return Organization.getOrCreate(contact.positions[index].organization)
                        } else {
                          return Promise.resolve()
                        }
                      })()
                        .then((organization) => {
                          return Position.getOrCreate(organization || null, _contact)
                        })
                        .then((position) => {
                          position.set('title', contact.positions[index].title)
                          return position.save()
                        })
                        .then(() => {
                          return updateNextPosition(index + 1)
                        })
                    } else {
                      return updateNextPosition(index + 1)
                    }
                  } else {
                    return Promise.resolve()
                  }
                }
                switch (key) {
                  case 'emails':
                    return updateArrayProp(Email, 'email', 0)
                  case 'locations':
                    return updateNextLocation(0)
                  case 'phoneNumbers':
                    return updateArrayProp(Phone, 'phone', 0)
                  case 'urls':
                    return updateArrayProp(URL, 'url', 0)
                  case 'positions':
                    return updateNextPosition(0)
                  default:
                    _contact.set(key, contact[key])
                    return Promise.resolve()
                }
              })
            )
              .then(() => {
                return _contact.save()
              })
          })
          .then(() => saveNextContact(index + 1))
      }
    }
    return saveNextContact(0)
  }

  findContactInDatabase (contact) {
    const tryNextProp = (propNum) => {
      const contactFinalizer = (contact) => {
        if (contact) {
          return contact
        } else {
          return tryNextProp(propNum + 1)
        }
      }
      const trySubPropIndex = (Klass, subPropIndex) => {
        if (subPropIndex < contact[SYNC_CONTACTS[propNum]].length) {
          return Klass.findContact(contact[SYNC_CONTACTS[propNum]])
            .then((_contact) => {
              if (_contact) {
                return _contact
              } else {
                return trySubPropIndex(Klass, subPropIndex + 1)
              }
            })
        } else {
          return Promise.resolve()
        }
      }
      if (propNum < SYNC_CONTACTS.length) {
        if (contact[SYNC_CONTACTS[propNum]]) {
          switch (SYNC_CONTACTS[propNum]) {
            case 'emails':
              return trySubPropIndex(Email, 0).then(contactFinalizer)
            case 'phones':
              return trySubPropIndex(Phone, 0).then(contactFinalizer)
            case 'urls':
              return trySubPropIndex(URL, 0).then(contactFinalizer)
            default:
              return Contact.byProp(SYNC_CONTACTS[propNum], contact[SYNC_CONTACTS[propNum]]).then(contactFinalizer)
          }
        } else {
          return tryNextProp(propNum + 1)
        }
      } else {
        return Promise.resolve(null)
      }
    }
    return tryNextProp(0)
  }

  findContactIndex (contact) {
    return this.contacts.findIndex((_contact) => {
      return !(!SYNC_CONTACTS.find((propName) => {
        switch (propName) {
          case 'emails':
          case 'phones':
          case 'urls':
            return contact[propName] && _contact[propName] && !(!_contact[propName].find((propValue) => {
              return contact[propName].indexOf(propValue) >= 0
            }))
          default:
            return contact[propName] && _contact[propName] && contact[propName] === _contact[propName]
        }
      }))
    })
  }

  commitContact (contact) {
    const existingContactIndex = this.findContactIndex(contact)
    if (existingContactIndex >= 0) {
      this.contacts[existingContactIndex] = merge(this.contacts[existingContactIndex], contact)
    } else {
      this.contacts.push(contact)
    }
  }
}

module.exports = ContactsSyncManager
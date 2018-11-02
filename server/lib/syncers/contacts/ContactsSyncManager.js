const merge = require('deepmerge')
const Contact = require('../../models/Contact')
const Email = require('../../models/Email')
const Phone = require('../../models/Phone')
const URL = require('../../models/URL')
const Position = require('../../models/Position')
const Location = require('../../models/Location')
const Organization = require('../../models/Organization')
const Photo = require('../../models/Photo')
const _ = require('lodash')
const arrayUniq = require('array-uniq')
const Tag = require('../../models/Tag')

const SYNC_CONTACTS = ['googleId', 'exchangeId', 'emails', 'name']
const UNIQUE_PROPS = ['emails', 'phoneNumbers', 'urls', 'locations', 'photos']

class ContactsSyncManager {
  constructor () {
    this.contacts = []
  }

  saveUpdates () {
    const saveNextContact = (index) => {
      if (index < this.contacts.length) {
        const contact = this.contacts[index]
        UNIQUE_PROPS.forEach((prop) => {
          contact[prop] = arrayUniq(contact[prop]).filter(value => value && typeof value === 'string')
        })
        return this.findContactInDatabase(contact)
          .then((dbContact) => {
            if (dbContact) {
              return Contact
                .forge()
                .query({
                  where: {
                    id: dbContact.get('id')
                  }
                })
                .fetch({
                  withRelated: [
                    'emails',
                    'locations',
                    'phoneNumbers',
                    'urls',
                    'positions',
                    'positions.organization',
                    'photos',
                    'tags'
                  ]
                })
            } else {
              return new Contact({
                name: contact.name,
                hidden: true
              }).save()
            }
          })
          .then((_contact) => {
            console.log('Updating ' + _contact.get('name'))
            return Promise.all(
              _.keys(contact).map((key) => {
                const standardRemoveCallback = (currentValueObject) => {
                  return currentValueObject.destroy()
                }
                const standardAddCallbackGenerator = (Klass) => {
                  return (newValue) => {
                    return Klass.getOrCreate(newValue, _contact)
                  }
                }
                const standardValuesFetcher = () => {
                  return _contact.related(key)
                }
                const standardValueMatcherGenerator = (valuePropName) => {
                  return (currentValueObject) => {
                    return (value) => {
                      return value === currentValueObject.get(valuePropName)
                    }
                  }
                }
                const standardObjectMatcherGenerator = (valuePropName) => {
                  return (value) => {
                    return (object) => {
                      return value === object.get(valuePropName)
                    }
                  }
                }
                const updateArrayProp = (name, currentValuesFetcher, valueMatcherGenerator, objectMatcherGenerator, removeCallback, addCallback) => {
                  let removedCount = 0
                  let addedCount = 0
                  return Promise.all(
                    currentValuesFetcher().map(currentValueObject => {
                      const found = contact[key].find(valueMatcherGenerator(currentValueObject))
                      if (!found) {
                        removedCount++
                        return removeCallback(currentValueObject)
                      }
                      return Promise.resolve()
                    })
                  )
                    .then(() => {
                      return Promise.all(
                        contact[key].map(newValue => {
                          const found = currentValuesFetcher().find(objectMatcherGenerator(newValue))
                          if (!found) {
                            addedCount++
                            return addCallback(newValue)
                          }
                          return Promise.resolve()
                        })
                      )
                    })
                    .then(() => {
                      console.log('Removed ' + removedCount + ' and added ' + addedCount + ' ' + name + ' records')
                    })
                }
                switch (key) {
                  case 'emails':
                    return updateArrayProp('email', standardValuesFetcher, standardValueMatcherGenerator('email'), standardObjectMatcherGenerator('email'), standardRemoveCallback, standardAddCallbackGenerator(Email))
                  case 'locations':
                    return updateArrayProp(
                      'location',
                      standardValuesFetcher,
                      standardValueMatcherGenerator('description'),
                      standardObjectMatcherGenerator('description'),
                      (currentValueObject) => {
                        return _contact.locations().detach(currentValueObject.get('id'))
                      },
                      (newValue) => {
                        return Location
                          .getOrCreate(newValue)
                          .then((location) => _contact.locations().attach([location.get('id')]))
                      }
                    )
                  case 'phoneNumbers':
                    return updateArrayProp('phone', standardValuesFetcher, standardValueMatcherGenerator('phone'), standardObjectMatcherGenerator('phone'), standardRemoveCallback, standardAddCallbackGenerator(Phone))
                  case 'urls':
                    return updateArrayProp('url', standardValuesFetcher, standardValueMatcherGenerator('url'), standardObjectMatcherGenerator('url'), standardRemoveCallback, standardAddCallbackGenerator(URL))
                  case 'photos':
                    return updateArrayProp('photo', standardValuesFetcher, standardValueMatcherGenerator('url'), standardObjectMatcherGenerator('url'), standardRemoveCallback, standardAddCallbackGenerator(Photo))
                  case 'positions':
                    contact.positions = contact.positions
                      .filter(position => {
                        return (position.title && position.title.trim().length > 0) || (position.organization && position.organization.trim().length > 0)
                      })
                      .map(position => {
                        return {
                          title: position.title ? position.title.trim() : null,
                          organization: position.organization ? position.organization.trim() : null
                        }
                      })
                    return updateArrayProp(
                      'position',
                      standardValuesFetcher,
                      (currentValueObject) => {
                        return ({organization, title}) => {
                          return (currentValueObject.related('organization') === organization || currentValueObject.related('organization').get('name') === organization) && currentValueObject.get('title') === title
                        }
                      },
                      ({organization, title}) => {
                        return (object) => {
                          return (object.related('organization') === organization || object.related('organization').get('name') === organization) && object.get('title') === title
                        }
                      },
                      standardRemoveCallback,
                      ({organization, title}) => {
                        return (() => {
                          if (organization) {
                            return Organization.getOrCreate(organization)
                          } else {
                            return Promise.resolve(null)
                          }
                        })()
                          .then(organizationObject => {
                            return Position.getOrCreate(organizationObject || null, _contact)
                          })
                          .then(positionObject => {
                            positionObject.set('title', title || null)
                            return positionObject.save()
                          })
                      }
                    )
                  case 'tags':
                    contact.tags = contact.tags
                      .filter(tag => tag && tag.trim().length > 0)
                      .map(tag => tag.trim())
                    return updateArrayProp(
                      'tag',
                      standardValuesFetcher,
                      standardValueMatcherGenerator('tag'),
                      standardObjectMatcherGenerator('tag'),
                      (currentValueObject) => {
                        return _contact.tags().detach(currentValueObject.get('id'))
                      },
                      (newValue) => {
                        return Tag
                          .getOrCreate(newValue)
                          .then(tag => _contact.tags().attach([tag.get('id')]))
                      }
                    )
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
          .catch(err => {
            console.error(err)
            const errorMessage = err.message || (err + '')
            throw new Error('ContactsSyncManager : ' + errorMessage)
          })
          .then(() => saveNextContact(index + 1))
      } else {
        return Promise.resolve()
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
            case 'phoneNumbers':
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
          case 'phoneNumbers':
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

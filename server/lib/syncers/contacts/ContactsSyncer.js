const Syncer = require('../Syncer')
const Contact = require('../../models/Contact')
const Email = require('../../models/Email')
const Phone = require('../../models/Phone')
const URL = require('../../models/URL')
const Position = require('../../models/Position')
const Location = require('../../models/Location')
const Organization = require('../../models/Organization')
const _ = require('lodash')

class ContactsSyncer extends Syncer {
  findContact (contact) {
    const propsToTry = this.uniqueIds()
    const tryNextProp = (propNum) => {
      const contactFinalizer = (contact) => {
        if (contact) {
          return contact
        } else {
          return tryNextProp(propNum + 1)
        }
      }
      const trySubPropIndex = (Klass, subPropIndex) => {
        if (subPropIndex < contact[propsToTry[propNum]].length) {
          return Klass.findContact(contact[propsToTry[propNum]])
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
      if (propNum < propsToTry.length) {
        if (contact[propsToTry[propNum]]) {
          switch (propsToTry[propNum]) {
            case 'emails':
              return trySubPropIndex(Email, 0).then(contactFinalizer)
            case 'phones':
              return trySubPropIndex(Phone, 0).then(contactFinalizer)
            case 'urls':
              return trySubPropIndex(URL, 0).then(contactFinalizer)
            default:
              return Contact.byProp(propsToTry[propNum], contact[propsToTry[propNum]]).then(contactFinalizer)
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

  updateContactFromJSON (contact) {
    return this.findContact(contact)
      .then((_contact) => {
        if (_contact) {
          return _contact.fetch({
            withRelated: [
              'locations'
            ]
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
                return Klass.getOrCreate(contact[key][index], _contact)
                  .then(() => {
                    return updateArrayProp(Klass, valuePropName, index + 1)
                  })
              } else {
                return Promise.resolve()
              }
            }
            const updateNextLocation = (index) => {
              if (index < contact.locations.length) {
                return Location
                  .getOrCreate(contact.locations[index])
                  .then((location) => {
                    const hasLocation = _contact.related('locations').filter((_location) => _location.get('id') === location.get('id')).length >= 0
                    if (!hasLocation) {
                      return _contact.locations().attach([location.get('id')])
                    }
                  })
                  .then(() => updateNextLocation(index + 1))
              } else {
                return Promise.resolve()
              }
            }
            const updateNextPosition = (index) => {
              if (index < contact.positions.length) {
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
                return Promise.resolve()
              }
            }
            switch (key) {
              case 'emails':
                return updateArrayProp(Email, 'email', 0)
              case 'locations':
                return updateNextLocation(0)
              case 'phones':
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
  }

  run () {
    return this.fetch()
      .then((contacts) => {
        const nextContact = (index) => {
          if (index < contacts.length) {
            return this.updateContactFromJSON(contacts[index])
              .catch((err) => {
                console.error(err)
                console.log(contacts[index])
              })
              .then(() => {
                return nextContact(index + 1)
              })
          }
        }
        return nextContact(0)
      })
      .then(() => {
        return super.run()
      })
  }

  uniqueIds () {
    return ['emails', 'name']
  }

  fetch () {
    throw new Error('Must override')
  }
}

module.exports = ContactsSyncer

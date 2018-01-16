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
  constructor (contactsSyncManager) {
    this.contactsSyncManager = contactsSyncManager
  }

  run () {
    return this.fetch()
      .then((contacts) => {
        contacts.forEach(contact => this.contactsSyncManager.commitContact(contact))
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

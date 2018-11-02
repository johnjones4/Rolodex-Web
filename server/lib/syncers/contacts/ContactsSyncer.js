const Syncer = require('../Syncer')

class ContactsSyncer extends Syncer {
  constructor (contactsSyncManager) {
    super()
    this.contactsSyncManager = contactsSyncManager
  }

  run () {
    return this.fetch()
      .then((contacts) => {
        contacts.forEach(contact => this.contactsSyncManager.commitContact(contact))
        return super.run()
      })
      .catch(err => {
        const className = this.constructor.name
        const errorMessage = err.message || (err + '')
        throw new Error(className + ': ' + errorMessage)
      })
  }

  fetch () {
    throw new Error('Must override')
  }
}

module.exports = ContactsSyncer

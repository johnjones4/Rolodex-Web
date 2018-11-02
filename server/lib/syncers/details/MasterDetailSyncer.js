const Syncer = require('../Syncer')

class MasterDetailSyncer extends Syncer {
  constructor (syncers, contactsSyncManager) {
    super()
    this.syncers = syncers
    this.contactsSyncManager = contactsSyncManager
  }

  isReady () {
    return true
  }

  getConfigKeyName () {
    return 'detailsync_master'
  }

  run () {
    return this.updateNextContact(0)
  }

  updateNextContact (index) {
    if (index < this.contactsSyncManager.contacts.length) {
      return Promise.all(
        this.syncers.map((syncer) => syncer.updateContact(this.contactsSyncManager.contacts[index]))
      )
        .then((contactUpdates) => {
          if (contactUpdates) {
            contactUpdates.forEach((contact) => {
              if (contact) {
                this.contactsSyncManager.commitContact(contact)
              }
            })
          }
          return this.updateNextContact(index + 1)
        })
        .catch(err => {
          const className = this.constructor.name
          const errorMessage = err.message || (err + '')
          throw new Error(className + ': ' + errorMessage)
        })
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = MasterDetailSyncer

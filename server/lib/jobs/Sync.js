const {
  GoogleContactsSyncer,
  ExchangeContactsSyncer
} = require('../syncers/contacts')
const {
  ExchangeInteractionsSyncer,
  IMAPInteractionsSyncer
} = require('../syncers/interactions')
const ContactsSyncManager = require('../syncers/contacts/ContactsSyncManager')

class Sync {
  constructor () {
    this.contactsSyncManager = new ContactsSyncManager()
    this.syncers = [
      new GoogleContactsSyncer(this.contactsSyncManager),
      new ExchangeContactsSyncer(this.contactsSyncManager),
      new ExchangeInteractionsSyncer(),
      new IMAPInteractionsSyncer()
    ]
  }

  run () {
    return this.runNext(0)
      .then(() => {
        return this.contactsSyncManager.saveUpdates()
      })
  }

  runNext (index) {
    if (index < this.syncers.length) {
      const syncer = this.syncers[index]
      return syncer.loadConfig()
        .then(() => {
          if (syncer.isReady()) {
            return syncer.run()
          }
        })
        .then(() => {
          return this.runNext(index + 1)
        })
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = Sync

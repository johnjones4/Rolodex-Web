const {
  GoogleContactsSyncer,
  ExchangeContactsSyncer,
  LinkedInConnectionsSyncer,
  GravatarSyncer
} = require('../syncers/contacts')
const {
  ExchangeInteractionsSyncer,
  IMAPInteractionsSyncer
} = require('../syncers/interactions')
const ContactsSyncManager = require('../syncers/contacts/ContactsSyncManager')

class Sync {
  constructor () {
    this.contactsSyncManager = new ContactsSyncManager()
    this.contactsSyncers = [
      new GoogleContactsSyncer(this.contactsSyncManager),
      new ExchangeContactsSyncer(this.contactsSyncManager),
      new LinkedInConnectionsSyncer(this.contactsSyncManager),
      new GravatarSyncer(this.contactsSyncManager)
    ]
    this.interactionSyncers = [
      new ExchangeInteractionsSyncer(),
      new IMAPInteractionsSyncer()
    ]
    this.errors = []
  }

  run () {
    return this.runNext(this.contactsSyncers, 0)
      .then(() => {
        return this.contactsSyncManager.saveUpdates().catch((err) => this.errors.push(err))
      })
      .then(() => {
        return this.runNext(this.interactionSyncers, 0)
      })
  }

  runNext (syncerList, index) {
    if (index < syncerList.length) {
      const syncer = syncerList[index]
      return syncer.loadConfig()
        .then(() => {
          if (syncer.isReady()) {
            return syncer.run().catch((err) => this.errors.push(err))
          }
        })
        .then(() => {
          return this.runNext(syncerList, index + 1)
        })
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = Sync

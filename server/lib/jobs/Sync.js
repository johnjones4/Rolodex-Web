const {
  GoogleContactsSyncer,
  ExchangeContactsSyncer,
  LinkedInConnectionsSyncer
} = require('../syncers/contacts')
const {
  GravatarSyncer,
  GitHubSyncer
} = require('../syncers/details')
const {
  ExchangeInteractionsSyncer,
  IMAPInteractionsSyncer
} = require('../syncers/interactions')
const ContactsSyncManager = require('../syncers/contacts/ContactsSyncManager')
const MasterDetailSyncer = require('../syncers/details/MasterDetailSyncer')
const {
  FrequencyRecommender
} = require('../recommenders')

class Sync {
  constructor () {
    this.contactsSyncManager = new ContactsSyncManager()
    this.contactsSyncers = [
      new GoogleContactsSyncer(this.contactsSyncManager),
      new ExchangeContactsSyncer(this.contactsSyncManager),
      new LinkedInConnectionsSyncer(this.contactsSyncManager),
      new MasterDetailSyncer([
        new GravatarSyncer(),
        new GitHubSyncer()
      ], this.contactsSyncManager)
    ]
    this.interactionSyncers = [
      new ExchangeInteractionsSyncer(),
      new IMAPInteractionsSyncer()
    ]
    this.recommenders = [
      new FrequencyRecommender()
    ]
  }

  logError (err) {
    let error
    if (typeof err === 'string') {
      error = err
    } else if (err.message) {
      error = err.message
    } else if (err.errors) {
      err.errors.forEach((_err) => this.logError(_err))
      return
    } else if (err.valueOf) {
      error = err.valueOf()
    } else {
      error = JSON.stringify(err)
    }
    process.send && process.send({error})
    console.trace(error)
  }

  run () {
    return this.runNextSync(this.contactsSyncers, 0)
      .then(() => {
        return this.contactsSyncManager.saveUpdates().catch((err) => this.logError(err))
      })
      .then(() => {
        return this.runNextSync(this.interactionSyncers, 0)
      })
      .then(() => {
        return this.runNextRecommender(0)
      })
      .catch((err) => this.logError(err))
  }

  runNextSync (syncerList, index) {
    if (index < syncerList.length) {
      const syncer = syncerList[index]
      return syncer.loadConfig()
        .then(() => {
          if (syncer.isReady()) {
            return syncer.run().catch((err) => this.logError(err))
          }
        })
        .then(() => {
          return this.runNextSync(syncerList, index + 1)
        })
    } else {
      return Promise.resolve()
    }
  }

  runNextRecommender (index) {
    if (index < this.recommenders.length) {
      return this.recommenders[index].run()
        .then(() => {
          return this.runNextRecommender(index + 1)
        })
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = Sync

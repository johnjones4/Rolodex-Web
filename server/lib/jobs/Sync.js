const {
  GoogleContactsSyncer,
  ExchangeContactsSyncer
} = require('../syncers/contacts')
const {
  ExchangeInteractionsSyncer,
  IMAPInteractionsSyncer
} = require('../syncers/interactions')

class Sync {
  constructor () {
    this.syncers = [
      new GoogleContactsSyncer(),
      new ExchangeContactsSyncer(),
      new ExchangeInteractionsSyncer(),
      new IMAPInteractionsSyncer()
    ]
  }

  run () {
    return this.runNext(0)
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
      console.log('Done Sync')
      return Promise.resolve()
    }
  }
}

module.exports = Sync

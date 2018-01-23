const Syncer = require('../Syncer')

class DetailSyncer extends Syncer {
  updateContact (contact) {
    throw new Error('Must override')
  }
}

module.exports = DetailSyncer

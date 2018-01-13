const InteractionsSyncer = require('./InteractionsSyncer')

class IMAPInteractionsSyncer extends InteractionsSyncer {
  getRecentInteractions (contacts) {

  }

  getConfigKeyName () {
    return 'interactionsyncer_imap'
  }
}

module.exports = IMAPInteractionsSyncer

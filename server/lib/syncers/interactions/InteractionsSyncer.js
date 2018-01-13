const Syncer = require('../Syncer')
const Contact = require('../../models/Contact')
const Interaction = require('../../models/Interaction')

class InteractionsSyncer extends Syncer {
  loadSyncContacts () {
    return Contact.query({
      where: {
        hidden: false
      }
    })
      .fetchAll({
        withRelated: [
          'emails',
          'interactions',
          'location',
          'urls',
          'phoneNumbers',
          'positions',
          'locations',
          'notes'
        ]
      })
  }

  getRecentInteractions (contacts) {
    throw new Error('Must override!')
  }

  saveInteraction (interaction) {
    return Interaction.getOrCreate(interaction.source, interaction.externalId)
      .then((interaction) => {
        return interaction.contacts().attach(interaction.contacts)
          .then(() => interaction)
      })
      .then((interaction) => {
        interaction.set({type: interaction.type})
        return interaction.save()
      })
  }

  run () {
    return this.loadSyncContacts()
      .then((contacts) => {
        return this.getRecentInteractions(contacts)
      })
      .then((interactions) => {
        return Promise.all(
          interactions.map((interaction) => this.saveInteraction(interaction))
        )
      })
      .then(() => {
        return super.run()
      })
  }
}

module.exports = InteractionsSyncer

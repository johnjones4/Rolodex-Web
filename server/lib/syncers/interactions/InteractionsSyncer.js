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

  getLastSyncDate () {
    return this.config.lastSync || (new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 7)))
  }

  getRecentInteractions (contacts) {
    throw new Error('Must override!')
  }

  saveInteraction (interaction) {
    console.log('Logging interaction "' + interaction.description + '"')
    return Interaction.getOrCreate(interaction.source, interaction.externalId)
      .then((_interaction) => {
        const addContactIds = interaction.contacts
          .map(contact => contact.get('id'))
          .filter(contactId => !_interaction.related('contacts').get(contactId))
        return _interaction.contacts().attach(addContactIds)
          .then(() => _interaction)
      })
      .then((_interaction) => {
        _interaction.set({
          type: interaction.type,
          description: interaction.description,
          date: interaction.date
        })
        return _interaction.save()
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

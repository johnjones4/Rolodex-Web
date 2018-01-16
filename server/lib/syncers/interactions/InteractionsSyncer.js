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
          'urls',
          'phoneNumbers',
          'positions',
          'locations',
          'notes'
        ]
      })
  }

  getLastSyncDate () {
    return this.config.lastSync || (new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 90)))
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

  dedupeInteractions (interactions) {
    const map = {}
    const deleteList = []
    interactions.forEach((interaction, index) => {
      const key = interaction.source + '_' + interaction.externalId
      if (map[key] >= 0) {
        deleteList.push(index)
        interaction.contacts.forEach((contact) => {
          const searchIndex = interactions[map[key]].contacts.find((_contact) => _contact.get('id') === contact.get('id'))
          if (searchIndex < 0) {
            interactions[map[key]].contacts.push(contact)
          }
        })
      }
      map[key] = 1
    })
    deleteList.forEach((index) => {
      interactions.splice(index, 1)
    })
    return interactions
  }

  run () {
    return this.loadSyncContacts()
      .then((contacts) => {
        return this.getRecentInteractions(contacts)
      })
      .then((interactions) => this.dedupeInteractions(interactions))
      .then((interactions) => {
        // TODO: may not be deduping properly
        const saveNextInteraction = (index) => {
          if (index < interactions.length) {
            return this.saveInteraction(interactions[index])
              .then(() => saveNextInteraction(index + 1))
          }
        }
        return saveNextInteraction(0)
      })
      .then(() => {
        return super.run()
      })
  }
}

module.exports = InteractionsSyncer

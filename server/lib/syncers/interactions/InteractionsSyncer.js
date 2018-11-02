const Syncer = require('../Syncer')
const Contact = require('../../models/Contact')
const Interaction = require('../../models/Interaction')

class InteractionsSyncer extends Syncer {
  constructor () {
    super()
    this.requiresDeepSync = false
  }

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
      .then((contacts) => {
        const unSyncedContact = contacts.find(contact => {
          return contact.get('updated_at').getTime() >= (new Date().getTime() - (1000 * 60 * 60 * 24))
        })
        if (unSyncedContact) {
          console.log(unSyncedContact.get('name') + ' forces deep sync')
          this.requiresDeepSync = true
        }
        return contacts
      })
  }

  getLastSyncDate () {
    return this.config.lastSync && !this.requiresDeepSync ? new Date(this.config.lastSync) : (new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 365)))
  }

  getRecentInteractions (contacts) {
    throw new Error('Must override!')
  }

  saveInteraction (interaction) {
    console.log('Logging interaction "' + interaction.description + '"')
    let date = interaction.date
    if (typeof date !== 'object') {
      date = new Date(Date.parse(date))
    }
    return Interaction.getOrCreate(interaction.source, interaction.externalId, date)
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
          date
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
    const now = new Date()
    return this.loadSyncContacts()
      .then((contacts) => {
        return this.getRecentInteractions(contacts)
      })
      .then((interactions) => this.dedupeInteractions(interactions))
      .then((interactions) => {
        const saveNextInteraction = (index) => {
          if (index < interactions.length) {
            return this.saveInteraction(interactions[index])
              .then(() => saveNextInteraction(index + 1))
          }
        }
        return saveNextInteraction(0)
      })
      .then(() => {
        this.setConfigProps({lastSync: now.getTime()})
        return super.run()
      })
      .catch(err => {
        const className = this.constructor.name
        const errorMessage = err.message || (err + '')
        throw new Error(className + ': ' + errorMessage)
      })
  }
}

module.exports = InteractionsSyncer

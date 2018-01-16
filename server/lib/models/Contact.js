const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
bookshelf.plugin('virtuals')

const Contact = module.exports = bookshelf.Model.extend({
  'tableName': 'contacts',
  'hasTimestamps': true,
  'emails': function () {
    const Email = require('./Email')
    return this.hasMany(Email)
  },
  'interactions': function () {
    const Interaction = require('./Interaction')
    return this.belongsToMany(Interaction)
  },
  'urls': function () {
    const URL = require('./URL')
    return this.hasMany(URL)
  },
  'phoneNumbers': function () {
    const Phone = require('./Phone')
    return this.hasMany(Phone)
  },
  'positions': function () {
    const Position = require('./Position')
    return this.hasMany(Position)
  },
  'locations': function () {
    const Location = require('./Location')
    return this.belongsToMany(Location)
  },
  'notes': function () {
    const Note = require('./Note')
    return this.hasMany(Note)
  },
  'virtuals': {
    'allNotes': function () {
      const notes = []
      this.related('notes')
        .forEach((note) => {
          notes.push(note)
        })
      this.related('interactions')
        .forEach((interaction) => {
          notes.push(interaction.related('note'))
        })
    },
    'lastInteraction': function () {
      if (this.related('interactions').length > 0) {
        let highestInteraction = null
        this.related('interactions').forEach((interaction) => {
          if (!highestInteraction || interaction.get('date').getTime() > highestInteraction.get('date').getTime()) {
            highestInteraction = interaction
          }
        })
        return highestInteraction
      } else {
        return null
      }
    }
  }
}, {
  'byProp': function (prop, value) {
    return Contact
      .forge()
      .query((qb) => {
        qb.where(prop, value)
      })
      .fetch()
  }
})

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
  'photos': function () {
    const Photo = require('./Photo')
    return this.hasMany(Photo)
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

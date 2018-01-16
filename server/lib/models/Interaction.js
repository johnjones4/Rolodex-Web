const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Interaction = module.exports = bookshelf.Model.extend({
  'tableName': 'interactions',
  'hasTimestamps': true,
  'contacts': function () {
    const Contact = require('./Contact')
    return this.belongsToMany(Contact)
  },
  'notes': function () {
    const Note = require('./Note')
    return this.hasMany(Note)
  },
  'parse': function (response) {
    response.date = new Date(response.date)
    return response
  }
}, {
  getOrCreate: function (source, externalId) {
    return Interaction
      .forge()
      .query((qb) => {
        qb.where({
          source,
          external_id: externalId
        })
      })
      .fetch({
        withRelated: ['contacts']
      })
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Interaction({
            source,
            external_id: externalId
          })
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

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
  'format': function () {
    const attrs = bookshelf.Model.prototype.format.apply(this, arguments)
    if (attrs.description && attrs.description.length > 255) {
      attrs.description = attrs.description.substring(0, 255)
    }
    return attrs
  }
}, {
  getOrCreate: function (source, externalId, date) {
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
            external_id: externalId,
            date
          })
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

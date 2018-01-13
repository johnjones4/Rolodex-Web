const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf.Model.extend({
  'tableName': 'notes',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  },
  'interaction': function () {
    const Interaction = require('./Interaction')
    return this.belongsTo(Interaction)
  }
})

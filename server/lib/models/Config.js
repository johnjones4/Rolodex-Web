const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
const jsonColumns = require('bookshelf-json-columns')
bookshelf.plugin(jsonColumns)

const Config = module.exports = bookshelf.Model.extend({
  'tableName': 'config',
  'hasTimestamps': true
}, {
  'jsonColumns': ['config'],
  'byKey': function (key) {
    return Config
      .forge()
      .query((qb) => {
        qb.where('key', key)
      })
      .fetch()
  }
})

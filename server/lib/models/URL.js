const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const URL = module.exports = bookshelf.Model.extend({
  'tableName': 'urls',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  }
}, {
  findContact: function (url) {
    return URL
      .forge()
      .query((qb) => {
        qb.where({
          'url': url
        })
      })
      .fetch()
  },
  getOrCreate: function (url, contact) {
    return URL
      .forge()
      .query((qb) => {
        qb.where({
          'url': url,
          'contact_id': contact.get('id')
        })
      })
      .fetch()
      .then((urlObj) => {
        if (urlObj) {
          return urlObj
        } else {
          const newURL = new URL({
            'url': url,
            'contact_id': contact.get('id')
          })
          return newURL
            .save()
            .then(() => newURL)
        }
      })
  }
})

const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Photo = module.exports = bookshelf.Model.extend({
  'tableName': 'photos',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  }
}, {
  findContact: function (url) {
    return Photo
      .forge()
      .query((qb) => {
        qb.where({
          'url': url
        })
      })
      .fetch({withRelated: ['contact']})
      .then((object) => {
        if (object) {
          return object.related('contact')
        } else {
          return null
        }
      })
  },
  getOrCreate: function (url, contact) {
    return Photo
      .forge()
      .query((qb) => {
        qb.where({
          'url': url,
          'contact_id': contact.get('id')
        })
      })
      .fetch()
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Photo({
            'url': url,
            'contact_id': contact.get('id')
          })
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

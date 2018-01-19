const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Phone = module.exports = bookshelf.Model.extend({
  'tableName': 'phones',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  }
}, {
  findContact: function (phone) {
    return Phone
      .forge()
      .query((qb) => {
        qb.where({
          'phone': phone
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
  getOrCreate: function (phone, contact) {
    return Phone
      .forge()
      .query((qb) => {
        qb.where({
          'phone': phone,
          'contact_id': contact.get('id')
        })
      })
      .fetch()
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Phone({
            'phone': phone,
            'contact_id': contact.get('id')
          })
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Email = module.exports = bookshelf.Model.extend({
  'tableName': 'emails',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  }
}, {
  findContact: function (email) {
    return Email
      .forge()
      .query((qb) => {
        qb.where({
          'email': email
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
  getOrCreate: function (email, contact) {
    return Email
      .forge()
      .query((qb) => {
        qb.where({
          'email': email,
          'contact_id': contact.get('id')
        })
      })
      .fetch()
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Email({
            'email': email,
            'contact_id': contact.get('id')
          })
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Position = module.exports = bookshelf.Model.extend({
  'tableName': 'positions',
  'hasTimestamps': true,
  'contact': function () {
    const Contact = require('./Contact')
    return this.belongsTo(Contact)
  },
  'organization': function () {
    const Organization = require('./Organization')
    return this.belongsTo(Organization)
  }
}, {
  getOrCreate: function (organization, contact) {
    const params = {
      'contact_id': contact.get('id')
    }
    if (organization) {
      params.organization_id = organization.get('id')
    }
    return Position
      .forge()
      .query((qb) => {
        qb.where(params)
      })
      .fetch()
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Position(params)
          return newObj
            .save()
            .then(() => newObj)
        }
      })
  }
})

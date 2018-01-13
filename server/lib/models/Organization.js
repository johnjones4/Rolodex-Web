const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Organization = module.exports = bookshelf.Model.extend({
  'tableName': 'organizations',
  'hasTimestamps': true
}, {
  getOrCreate: function (name) {
    return Organization
      .forge()
      .query((qb) => {
        qb.where('name', name)
      })
      .fetch()
      .then((organization) => {
        if (organization) {
          return organization
        } else {
          const newOrganization = new Organization({
            'name': name
          })
          return newOrganization
            .save()
            .then(() => {
              return newOrganization
            })
        }
      })
  }
})

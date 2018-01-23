const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

const Tag = module.exports = bookshelf.Model.extend({
  'tableName': 'tags',
  'hasTimestamps': true
}, {
  getOrCreate: function (tag) {
    return Tag
      .forge()
      .query({
        where: {
          tag
        }
      })
      .fetch()
      .then((obj) => {
        if (obj) {
          return obj
        } else {
          const newObj = new Tag({
            tag
          })
          return newObj
            .save()
            .then(() => {
              return newObj
            })
        }
      })
  }
})

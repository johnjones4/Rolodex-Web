const Tag = require('../models/Tag')

exports.getTags = (req, res, next) => {
  Tag
    .forge()
    .orderBy('tag')
    .fetchAll()
    .then((tags) => {
      res.send(tags.toJSON())
    })
}

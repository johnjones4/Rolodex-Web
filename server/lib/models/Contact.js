const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
bookshelf.plugin('virtuals')

const Contact = module.exports = bookshelf.Model.extend({
  'tableName': 'contacts',
  'hasTimestamps': true,
  'parse': function (attrs) {
    attrs.updateFrequency = parseInt(attrs.updateFrequency)
    return attrs
  },
  'emails': function () {
    const Email = require('./Email')
    return this.hasMany(Email)
  },
  'interactions': function () {
    const Interaction = require('./Interaction')
    return this.belongsToMany(Interaction)
  },
  'urls': function () {
    const URL = require('./URL')
    return this.hasMany(URL)
  },
  'photos': function () {
    const Photo = require('./Photo')
    return this.hasMany(Photo)
  },
  'phoneNumbers': function () {
    const Phone = require('./Phone')
    return this.hasMany(Phone)
  },
  'positions': function () {
    const Position = require('./Position')
    return this.hasMany(Position)
  },
  'locations': function () {
    const Location = require('./Location')
    return this.belongsToMany(Location)
  },
  'notes': function () {
    const Note = require('./Note')
    return this.hasMany(Note)
  },
  'tags': function () {
    const Tag = require('./Tag')
    return this.belongsToMany(Tag)
  },
  'setTags': function (newTags) {
    const cleanTagList = cleanTags(newTags)
    const sameSet = compareNewTagSet(this.related('tags'), cleanTagList)
    if (!sameSet) {
      return this.tags().detach(this.related('tags').map(tag => tag.get('id')))
        .then(() => {
          const Tag = require('./Tag')
          return Promise.all(
            cleanTagList.map((tag) => {
              return Tag.getOrCreate(tag.tag)
            })
          )
        })
        .then((tags) => {
          return this.tags().attach(tags.map((tag) => tag.get('id')))
        })
    } else {
      return Promise.resolve()
    }
  }
}, {
  'byProp': function (prop, value) {
    return Contact
      .forge()
      .query((qb) => {
        qb.where(prop, value)
      })
      .fetch()
  }
})

const cleanTags = (tags) => {
  const strMap = {}
  return tags.filter((tag) => {
    if (strMap[tag.tag]) {
      return false
    } else {
      strMap[tag.tag] = true
      return true
    }
  })
}

const compareNewTagSet = (currentTags, newTags) => {
  newTags = newTags.filter(t => t && t.tag)
  newTags.sort((a, b) => {
    return (a && b && a.tag && b.tag) ? a.tag.localeCompare(b.tag) : 0
  })
  currentTags.sortBy('tag')
  if (newTags.length !== currentTags.length) {
    return false
  } else {
    for (let i = 0; i < newTags.length; i++) {
      if (newTags[i].tag !== currentTags.at(i).get('tag')) {
        return false
      }
    }
    return true
  }
}

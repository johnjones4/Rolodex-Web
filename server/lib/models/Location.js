const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
const NodeGeocoder = require('node-geocoder')

const Location = module.exports = bookshelf.Model.extend({
  'tableName': 'locations',
  'hasTimestamps': true,
  'initialize': function () {
    this.geocoder = NodeGeocoder({
      'provider': 'google',
      'apiKey': process.env.GOOGLE_API_KEY,
      'formatter': 'json'
    })
    this.on('creating', function () {
      return this.geocode()
    }, this)
    this.on('updating', function () {
      return this.geocode()
    }, this)
    bookshelf.Model.prototype.initialize.apply(this, arguments)
  },
  geocode: function () {
    if (this.get('description') !== this.previous('description')) {
      return this.geocoder.geocode(this.get('description'))
        .then((geoData) => {
          if (geoData && geoData.length > 0) {
            this.set({
              'latitude': geoData[0].latitude,
              'longitude': geoData[0].longitude
            })
          }
        })
        .catch((err) => console.error(err))
    }
  }
}, {
  getOrCreate: function (description) {
    return Location
      .forge()
      .query((qb) => {
        qb.where('description', description)
      })
      .fetch()
      .then((location) => {
        if (location) {
          return location
        } else {
          const newLocation = new Location({
            'description': description
          })
          return newLocation
            .save()
            .then(() => {
              return newLocation
            })
        }
      })
  }
})

const Contact = require('../models/Contact')

class Recommender {
  run () {
    return Contact
      .query({})
      .fetchAll({
        withRelated: [
          'interactions'
        ]
      })
      .then((contacts) => {
        return Promise.all(
          contacts
            .filter(contact => !(!contact))
            .map(contact => this.makeContactRecommendations(contact))
        )
      })
  }

  makeContactRecommendations (contact) {
    throw new Error('Must override')
  }
}

module.exports = Recommender

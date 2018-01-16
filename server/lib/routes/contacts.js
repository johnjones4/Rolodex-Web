const Contact = require('../models/Contact')

const relatedFields = [
  'emails',
  'interactions',
  'interactions.notes',
  'locations',
  'urls',
  'phoneNumbers',
  'positions',
  'positions.organization',
  'notes'
]

const deleteProps = [
  'id',
  'created_at',
  'updated_at',
  'emails',
  'interactions',
  'locations',
  'urls',
  'phoneNumbers',
  'positions',
  'notes'
]

exports.loadContact = (req, res, next, id) => {
  Contact
    .query({
      where: {
        id
      }
    })
    .fetch({
      withRelated: relatedFields
    })
    .then((contact) => {
      if (contact) {
        req.contact = contact
        next()
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => next(err))
}

exports.getContacts = (req, res, next) => {
  const params = {}
  if (!req.query.showHidden) {
    params.where = {
      hidden: false
    }
  }
  Contact
    .query(params)
    .orderBy('name')
    .fetchAll({
      withRelated: relatedFields
    })
    .then((contacts) => {
      res.send(contacts.toJSON())
    })
    .catch(err => next(err))
}

exports.saveContact = (req, res, next) => {
  const contact = req.contact || new Contact()
  deleteProps.forEach(prop => delete req.body[prop])
  contact.set(req.body)
  contact.save()
    .then(() => {
      res.send(contact.toJSON())
    })
    .catch(err => next(err))
}

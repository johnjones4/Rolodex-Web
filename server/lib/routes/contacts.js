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
  'notes',
  'photos',
  'tags'
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
  'notes',
  'photos',
  'tags'
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
    .fetchAll()
    .then((contacts) => {
      return Promise.all(
        contacts.map((contact) => {
          return contact.load(relatedFields)
        })
      ).then(() => contacts)
    })
    .then((contacts) => {
      res.send(contacts.toJSON())
    })
    .catch(err => next(err))
}

exports.saveContact = (req, res, next) => {
  const contact = req.contact || new Contact()
  const tags = req.body.tags.slice(0)
  deleteProps.forEach(prop => delete req.body[prop])
  contact.set(req.body)
  contact.setTags(tags)
    .then(() => {
      return contact.save()
    })
    .then(() => {
      return contact.load(['tags'])
    })
    .then(() => {
      res.send(contact.toJSON())
    })
    .catch(err => next(err))
}

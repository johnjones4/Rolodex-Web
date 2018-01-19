const Interaction = require('../models/Interaction')

exports.saveInteraction = (req, res, next) => {
  const interaction = new Interaction()
  const contactIds = req.body.contacts.map(contact => contact.id)
  const fields = Object.assign({}, req.body)
  delete fields.contacts
  delete fields.id
  delete fields.created_at
  delete fields.updated_at
  interaction.set(fields)
  interaction.save()
    .then(() => {
      return interaction.contacts().attach(contactIds)
    })
    .then(() => {
      return interaction.load(['contacts'])
    })
    .then(() => {
      res.send(interaction.toJSON())
    })
    .catch(err => next(err))
}

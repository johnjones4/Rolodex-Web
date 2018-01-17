const Interaction = require('../models/Interaction')

exports.saveInteraction = (req, res, next) => {
  const interaction = new Interaction()
  delete req.body.id
  delete req.body.created_at
  delete req.body.updated_at
  interaction.set(req.body)
  interaction.save()
    .then(() => {
      res.send(interaction.toJSON())
    })
    .catch(err => next(err))
}

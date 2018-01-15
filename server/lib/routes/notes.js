const Note = require('../models/Note')

exports.loadNote = (req, res, next, id) => {
  Note
    .query({
      where: {
        id
      }
    })
    .fetch()
    .then((note) => {
      if (note) {
        req.note = note
        next()
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => next(err))
}

exports.saveNote = (req, res, next) => {
  const note = req.contact || new Note()
  delete req.body.id
  delete req.body.created_at
  delete req.body.updated_at
  note.set(req.body)
  note.save()
    .then(() => {
      res.send(note.toJSON())
    })
    .catch(err => next(err))
}

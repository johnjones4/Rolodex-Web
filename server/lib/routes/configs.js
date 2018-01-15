const Config = require('../models/Config')

exports.loadConfig = (req, res, next, id) => {
  Config
    .query({
      where: {
        id
      }
    })
    .fetch()
    .then((config) => {
      if (config) {
        req.config = config
        next()
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => next(err))
}

exports.getConfigs = (req, res, next) => {
  Config
    .query()
    .fetchAll()
    .then((configs) => {
      res.send(configs.toJSON())
    })
    .catch(err => next(err))
}

exports.saveConfig = (req, res, next) => {
  const config = req.config || new Config()
  delete req.body.id
  delete req.body.created_at
  delete req.body.updated_at
  config.set(req.body)
  config.save()
    .then(() => {
      res.send(config.toJSON())
    })
    .catch(err => next(err))
}

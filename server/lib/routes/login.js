const jwt = require('jsonwebtoken')
const {
  jwtSecret,
  user
} = require('../consts')

exports.login = (req, res, next) => {
  if (req.body.username &&
      req.body.password &&
      req.body.username === user.username &&
      req.body.password === user.password) {
    const token = jwt.sign({id: user.username}, jwtSecret)
    res.json({token})
  } else {
    res.sendStatus(401)
  }
}

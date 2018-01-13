['authorizors'].forEach((route) => {
  exports[route] = require('./' + route)
})

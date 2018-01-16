['authorizors', 'contacts', 'notes', 'configs', 'sync'].forEach((route) => {
  exports[route] = require('./' + route)
})

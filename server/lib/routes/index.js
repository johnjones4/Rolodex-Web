['authorizors', 'contacts', 'notes', 'configs'].forEach((route) => {
  exports[route] = require('./' + route)
})

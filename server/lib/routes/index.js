['authorizors', 'contacts', 'notes', 'configs', 'sync', 'interactions', 'upload'].forEach((route) => {
  exports[route] = require('./' + route)
})

['authorizors', 'contacts', 'notes', 'configs', 'sync', 'interactions'].forEach((route) => {
  exports[route] = require('./' + route)
})

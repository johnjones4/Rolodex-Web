['authorizors', 'contacts', 'notes', 'configs', 'sync', 'interactions', 'upload', 'login'].forEach((route) => {
  exports[route] = require('./' + route)
})

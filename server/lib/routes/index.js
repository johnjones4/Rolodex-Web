['authorizors', 'contacts', 'notes', 'configs', 'sync', 'interactions', 'upload', 'login', 'tags'].forEach((route) => {
  exports[route] = require('./' + route)
})

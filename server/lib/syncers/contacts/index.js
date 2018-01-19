['GoogleContactsSyncer', 'ExchangeContactsSyncer', 'LinkedInConnectionsSyncer'].forEach((klass) => {
  exports[klass] = require('./' + klass)
})

['GoogleContactsSyncer', 'ExchangeContactsSyncer', 'LinkedInConnectionsSyncer', 'GravatarSyncer'].forEach((klass) => {
  exports[klass] = require('./' + klass)
})

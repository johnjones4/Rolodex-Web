['GoogleContactsSyncer', 'ExchangeContactsSyncer'].forEach((klass) => {
  exports[klass] = require('./' + klass)
})

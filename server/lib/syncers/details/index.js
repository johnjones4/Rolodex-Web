['GitHubSyncer', 'GravatarSyncer'].forEach((klass) => {
  exports[klass] = require('./' + klass)
})

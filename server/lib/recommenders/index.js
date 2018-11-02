['FrequencyRecommender'].forEach((klass) => {
  exports[klass] = require('./' + klass)
})

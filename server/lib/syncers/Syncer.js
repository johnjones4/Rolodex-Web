const Config = require('../models/Config')

class Syncer {
  constructor () {
    this.configChanged = false
    this.config = false
  }

  isReady () {
    return !(!this.config)
  }

  setConfigProps (config) {
    this.config = Object.assign({}, this.config, config)
    this.configChanged = true
  }

  loadConfig () {
    return Config.byKey(this.getConfigKeyName())
      .then((_config) => {
        if (_config) {
          this.config = _config.get('config')
        }
      })
  }

  saveConfig () {
    return Config.byKey(this.getConfigKeyName())
      .then((_config) => {
        if (_config) {
          _config.set('config', this.config)
          return _config.save()
        } else {
          return new Config({
            key: this.getConfigKeyName(),
            config: this.config
          }).save()
        }
      })
  }

  getConfigKeyName () {
    throw new Error('Must override')
  }

  run () {
    if (this.configChanged) {
      return this.saveConfig()
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = Syncer

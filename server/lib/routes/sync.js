const syncLauncher = require('../util/syncLauncher')

exports.checkSync = (req, res, next) => {
  sendStatus(res)
}

exports.startSync = (req, res, next) => {
  syncLauncher.launch()
  sendStatus(res)
}

const sendStatus = (res) => {
  res.send({
    isSyncing: syncLauncher.isRunning(),
    errors: syncLauncher.getErrors()
  })
}

const Sync = require('../jobs/Sync')

let isSyncing = false

exports.checkSync = (req, res, next) => {
  res.send({isSyncing})
}

exports.startSync = (req, res, next) => {
  if (!isSyncing) {
    isSyncing = true
    new Sync().run()
      .catch((err) => {
        console.error(err)
      })
      .then(() => {
        isSyncing = false
      })
  }
  res.send({isSyncing})
}

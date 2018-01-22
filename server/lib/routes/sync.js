const Sync = require('../jobs/Sync')

let sync = null
let lastSyncErrors = []

exports.checkSync = (req, res, next) => {
  sendStatus(res)
}

exports.startSync = (req, res, next) => {
  if (!sync) {
    sync = new Sync()
    sync.run()
      .then(() => {
        lastSyncErrors = sync.errors.slice(0)
        sync = null
      })
  }
  sendStatus(res)
}

const sendStatus = (res) => {
  res.send({
    isSyncing: !(!sync),
    errors: sync ? sync.errors : lastSyncErrors
  })
}

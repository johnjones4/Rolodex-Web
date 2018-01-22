const { fork } = require('child_process')

let syncRunning = false
let subProcess
let errors

exports.launch = () => {
  if (!syncRunning) {
    syncRunning = true
    errors = []
    subProcess = fork('./bin/sync')
    subProcess.on('exit', () => {
      syncRunning = false
      console.log('Sync process complete')
    })
    subProcess.on('message', (message) => {
      if (message.error) {
        errors.push(message.error)
      }
      console.log(message)
    })
    console.log(`Spawned process ${subProcess.pid} to handle sync.`)
  }
}

exports.isRunning = () => {
  return syncRunning
}

exports.getErrors = () => {
  return errors ? errors.slice(0) : []
}

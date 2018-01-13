require('dotenv').config()
const webserver = require('../lib/webserver')
const database = require('../lib/database')
const consts = require('../lib/consts')

database.init()
  .then(() => {
    return new Promise((resolve, reject) => {
      webserver.init().listen(consts.port, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  .then(() => {
    console.log('Server running')
  })
  .catch((err) => {
    console.error(err)
    process.exit(-1)
  })

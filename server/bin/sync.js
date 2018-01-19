require('dotenv').config()
const Sync = require('../lib/jobs/Sync')
const database = require('../lib/database')

const sync = new Sync()

database.init()
  .then(() => {
    return sync.run()
  })
  .then(() => {
    if (sync.errors && sync.errors.length > 0) {
      sync.errors.forEach(err => console.error(err))
      process.exit(-1)
    }
    console.log('Done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(-1)
  })

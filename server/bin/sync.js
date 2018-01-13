require('dotenv').config()
const Sync = require('../lib/jobs/Sync')
const database = require('../lib/database')

database.init()
  .then(() => {
    return new Sync().run()
  })
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(-1)
  })

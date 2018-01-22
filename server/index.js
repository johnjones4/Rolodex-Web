require('./bin/www')
const CronJob = require('cron').CronJob
const { sync } = require('./lib/consts')
const syncLauncher = require('./lib/util/syncLauncher')

CronJob(
  sync.schedule,
  () => syncLauncher.launch(),
  null,
  true,
  sync.tz
)

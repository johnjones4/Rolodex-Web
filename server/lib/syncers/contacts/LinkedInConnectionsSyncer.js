const ContactsSyncer = require('./ContactsSyncer')
const {uploadDir} = require('../../consts')
const parse = require('csv-parse')
const fs = require('fs')
const path = require('path')

class LinkedInConnectionsSyncer extends ContactsSyncer {
  isReady () {
    return super.isReady() && this.config.file
  }

  fetch () {
    return new Promise((resolve, reject) => {
      const parser = parse({columns: true}, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
      fs.createReadStream(path.join(uploadDir, this.config.file)).pipe(parser)
    })
      .then((contacts) => {
        if (contacts) {
          return contacts.map((contact) => {
            const object = {}
            if (contact['First Name'] && contact['Last Name']) {
              object.name = [contact['First Name'], contact['Last Name']].join(' ').trim()
            }
            if (contact['Email Address']) {
              object.emails = [contact['Email Address'].trim()]
            }
            if (contact['Company'] && contact['Position']) {
              object.positions = [
                {
                  organization: contact['Company'].trim(),
                  title: contact['Position'].trim()
                }
              ]
            }
            return object
          })
        } else {
          return []
        }
      })
  }

  getConfigKeyName () {
    return 'importer_linkedin'
  }
}

module.exports = LinkedInConnectionsSyncer

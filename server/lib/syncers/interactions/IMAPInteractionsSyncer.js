const InteractionsSyncer = require('./InteractionsSyncer')
const Imap = require('imap')
const {interactionTypes} = require('../../consts')

class IMAPInteractionsSyncer extends InteractionsSyncer {
  getConfigKeyName () {
    return 'interactionsyncer_imap'
  }

  getRecentInteractions (contacts) {
    const imap = new Imap(this.config.credentials)
    const final = []
    return this.openImapConnection(imap)
      .then(() => {
        return this.getReceivedEmailInteractions(imap, contacts)
      })
      .then((interactions) => {
        interactions.forEach((interaction) => final.push(interaction))
        return this.getSentEmailInteractions(imap, contacts)
      })
      .then((interactions) => {
        interactions.forEach((interaction) => final.push(interaction))
      })
      .then(() => final)
  }

  getReceivedEmailInteractions (imap, contacts) {
    return this.openMailbox(imap, this.config.mailboxes.inbox)
      .then(() => this.searchOpenMailbox(imap, contacts, 'FROM'))
      .then((emailIds) => this.loadMessages(imap, emailIds))
      .then((emails) => this.fromEmailsToInteractions(emails, contacts))
  }

  getSentEmailInteractions (imap, contacts) {
    return this.openMailbox(imap, this.config.mailboxes.sent)
      .then(() => {
        return Promise.all([
          this.searchOpenMailbox(imap, contacts, 'TO'),
          this.searchOpenMailbox(imap, contacts, 'CC'),
          this.searchOpenMailbox(imap, contacts, 'BCC')
        ])
          .then((arrayOfArrays) => {
            const emailIds = []
            arrayOfArrays.forEach((array) => array.forEach((emailId) => emailIds.push(emailId)))
            return emailIds
          })
      })
      .then((emailIds) => this.loadMessages(imap, emailIds))
      .then((emails) => this.toEmailsToInteractions(emails, contacts))
  }

  extractEmailAddress (string) {
    const start = string.indexOf('<') + 1
    const end = string.indexOf('>')
    return string.substring(start, end).trim()
  }

  openImapConnection (imap) {
    return new Promise((resolve, reject) => {
      imap.once('error', (err) => reject(err))
      imap.once('ready', () => {
        resolve()
      })
      imap.connect()
    })
  }

  openMailbox (imap, box) {
    return new Promise((resolve, reject) => {
      imap.openBox(box, true, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  emailAddressesFromContacts (contacts) {
    const emailAddresses = []
    contacts.forEach((contact) => {
      contact.related('emails').forEach((email) => {
        emailAddresses.push(email.get('email'))
      })
    })
    return emailAddresses
  }

  searchOpenMailbox (imap, contacts, searchField) {
    const emailAddresses = this.emailAddressesFromContacts(contacts)
    const searchNextEmail = (index, emailIds) => {
      if (index < emailAddresses.length) {
        return new Promise((resolve, reject) => {
          const searchCrit = [[searchField, emailAddresses[index]], ['SINCE', this.getLastSyncDate()]]
          imap.search(searchCrit, (err, results) => {
            if (err) {
              reject(err)
            } else {
              resolve(results)
            }
          })
        })
          .then((searchResults) => {
            searchResults.forEach((result) => emailIds.push(result))
          })
          .then(() => searchNextEmail(index + 1, emailIds))
      } else {
        return Promise.resolve(emailIds)
      }
    }
    return searchNextEmail(0, [])
  }

  loadMessages (imap, emailIds) {
    if (emailIds && emailIds.length > 0) {
      return new Promise((resolve, reject) => {
        const messages = []
        const f = imap.fetch(emailIds, { bodies: ['HEADER.FIELDS (TO CC BCC FROM SUBJECT DATE)'] })
        f.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            let buffer = ''
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8')
            })
            stream.once('end', () => {
              const info = Imap.parseHeader(buffer)
              info.uid = seqno
              messages.push(info)
            })
          })
        })
        f.once('error', (err) => reject(err))
        f.once('end', () => resolve(messages))
      })
    } else {
      return Promise.resolve([])
    }
  }

  fromEmailsToInteractions (emails, contacts) {
    return emails.map((email) => {
      const from = this.extractEmailAddress(email.from[0]).toLowerCase()
      const interactionContacts = contacts.filter((contact) => {
        return contact.related('emails').filter(email => email.get('email').toLowerCase() === from).length > 0
      })
      return this.mapItemToInteraction(email, interactionTypes.EMAIL_RECEIVED, interactionContacts)
    })
  }

  toEmailsToInteractions (emails, contacts) {
    return emails.map((email) => {
      const toEmails = [].concat(
        (email.to && email.to.length) ? email.to.map((email) => this.extractEmailAddress(email).toLowerCase()) : [],
        (email.cc && email.cc.length) ? email.cc.map((email) => this.extractEmailAddress(email).toLowerCase()) : [],
        (email.bcc && email.bcc.length) ? email.bcc.map((email) => this.extractEmailAddress(email).toLowerCase()) : []
      ).filter((email) => email && email.trim().length > 0)
      const interactionContacts = contacts.filter((contact) => {
        return contact.related('emails').filter(email => toEmails.indexOf(email.get('email').toLowerCase()) >= 0).length > 0
      })
      return this.mapItemToInteraction(email, interactionTypes.EMAIL_SENT, interactionContacts)
    })
  }

  mapItemToInteraction (email, type, contacts) {
    return {
      type,
      contacts,
      description: email.subject ? email.subject[0] : '',
      externalId: email.uid,
      source: this.getConfigKeyName(),
      date: email.date[0]
    }
  }
}

module.exports = IMAPInteractionsSyncer

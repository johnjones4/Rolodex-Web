const ews = require('ews-javascript-api')
const EWSFactory = require('../../util/EWSFactory')
const InteractionsSyncer = require('./InteractionsSyncer')
const {interactionTypes} = require('../../consts')

const PAGE_SIZE = 1000

class ExchangeInteractionsSyncer extends InteractionsSyncer {
  getRecentInteractions (contacts) {
    const exch = new EWSFactory().initInstance(this.config.credentials)
    const final = []
    return this.getReceivedEmailInteractions(exch, contacts)
      .then((interactions) => {
        interactions.forEach((interaction) => final.push(interaction))
        return this.getSentEmailInteractions(exch, contacts)
      })
      .then((interactions) => {
        interactions.forEach((interaction) => final.push(interaction))
        return this.getCalendarInterations(exch, contacts)
      })
      .then((interactions) => {
        interactions.forEach((interaction) => final.push(interaction))
      })
      .then(() => final)
  }

  getSearchFolders (exch) {
    const view = new ews.FolderView()
    view.Traversal = ews.FolderTraversal.Deep
    return exch.FindFolders(ews.WellKnownFolderName.MsgFolderRoot, view)
      .then((folders) => {
        return folders.folders.map((folder) => folder.Id)
      })
  }

  generateStartDateFilter () {
    const startDateFilter = new ews.SearchFilter.IsGreaterThanOrEqualTo()
    startDateFilter.PropertyDefinition = ews.EmailMessageSchema.DateTimeReceived
    startDateFilter.Value = this.getLastSyncDate().toISOString()
    return startDateFilter
  }

  getReceivedEmailInteractions (exch, contacts) {
    const masterSearchGroup = new ews.SearchFilter.SearchFilterCollection()
    masterSearchGroup.LogicalOperator = ews.LogicalOperator.And

    masterSearchGroup.Add(this.generateStartDateFilter())

    const contactsSearchGroup = new ews.SearchFilter.SearchFilterCollection()
    contactsSearchGroup.LogicalOperator = ews.LogicalOperator.Or
    contacts.forEach((contact) => {
      contact.related('emails').forEach((email) => {
        const fromFilter = new ews.SearchFilter.IsEqualTo()
        fromFilter.ComparisonMode = ews.ComparisonMode.IgnoreCase
        fromFilter.PropertyDefinition = ews.EmailMessageSchema.From
        fromFilter.Value = new ews.EmailAddress(email.get('email'))
        contactsSearchGroup.Add(fromFilter)
      })
    })
    masterSearchGroup.Add(contactsSearchGroup)

    const searchNextFolder = (folderIds, folderIndex, interactions) => {
      if (folderIndex < folderIds.length) {
        const searchNextPage = (page) => {
          console.log('Loading received Exchange emails folder #' + folderIndex + ' / page ' + page)
          const view = new ews.ItemView(PAGE_SIZE, page * PAGE_SIZE)
          return exch.FindItems(folderIds[folderIndex], masterSearchGroup, view)
            .then((items) => {
              if (items.items.length > 0) {
                console.log('Found ' + items.items.length + ' items')
                items.items.map((item) => {
                  const fromContacts = contacts.filter((contact) => {
                    for (let i = 0; i < contact.related('emails').length; i++) {
                      if (item.From && contact.related('emails').at(i).get('email').toLowerCase() === item.From.address.trim().toLowerCase()) {
                        return true
                      }
                    }
                    return false
                  })
                  return this.mapItemToInteraction(item, interactionTypes.EMAIL_RECEIVED, 'DateTimeReceived', fromContacts)
                }).forEach((item) => interactions.push(item))
                if (items.items.length === PAGE_SIZE) {
                  return searchNextPage(page + 1)
                } else {
                  return searchNextFolder(folderIds, folderIndex + 1, interactions) 
                }
              } else {
                return searchNextFolder(folderIds, folderIndex + 1, interactions)
              }
            })
            .catch((error) => {
              if (error.message !== 'The collection is empty.') {
                throw error
              } else {
                return searchNextFolder(folderIds, folderIndex + 1, interactions)
              }
            })
        }
        return searchNextPage(0)
      } else {
        return Promise.resolve(interactions)
      }
    }
    return this.getSearchFolders(exch)
      .then((folderIds) => searchNextFolder(folderIds, 0, []))
  }

  getContactsMatchEmails (contacts, emails) {
    return contacts.filter((contact) => {
      for (let i = 0; i < contact.related('emails').length; i++) {
        if (emails.indexOf(contact.related('emails').at(i).get('email').toLowerCase()) >= 0) {
          return true
        }
      }
      return false
    })
  }

  getSentEmailInteractions (exch, contacts) {
    let agResults = []
    const loadNextPage = (page) => {
      console.log('Loading sent Exchange emails page ' + page)
      const view = new ews.ItemView(PAGE_SIZE, page * PAGE_SIZE)
      return exch.FindItems(ews.WellKnownFolderName.SentItems, this.generateStartDateFilter(), view)
        .then((results) => {
          return exch.LoadPropertiesForItems(results.items, new ews.PropertySet(ews.BasePropertySet.FirstClassProperties, [
            ews.EmailMessageSchema.ToRecipients,
            ews.EmailMessageSchema.CcRecipients,
            ews.EmailMessageSchema.BccRecipients
          ]))
        })
        .then((results) => {
          if (results.responses.length > 0) {
            agResults = agResults.concat(results.responses
              .map(({item}) => {
                const toEmails = [].concat(
                  item.ToRecipients.items.map((emailAddress) => emailAddress.address.trim().toLowerCase()),
                  item.CcRecipients.items.map((emailAddress) => emailAddress.address.trim().toLowerCase()),
                  item.BccRecipients.items.map((emailAddress) => emailAddress.address.trim().toLowerCase())
                )
                const matchingContacts = this.getContactsMatchEmails(contacts, toEmails)
                if (matchingContacts.length > 0) {
                  return this.mapItemToInteraction(item, interactionTypes.EMAIL_SENT, 'DateTimeSent', matchingContacts)
                } else {
                  return false
                }
              })
              .filter((interaction) => !(!interaction))
            )
            if (results.responses.length === PAGE_SIZE) {
              return loadNextPage(page + 1)
            } else {
              return agResults
            }
          } else {
            return agResults
          }
        })
        .catch((error) => {
          if (error.message !== 'The collection is empty.') {
            throw error
          } else {
            return []
          }
        })
    }
    return loadNextPage(0)
  }

  getCalendarInterations (exch, contacts) {
    console.log('Loading Exchange calendar events')
    const view = new ews.CalendarView()
    view.StartDate = this.getLastSyncDate().toISOString()
    view.EndDate = new Date().toISOString()
    view.maxItemsReturned = PAGE_SIZE
    return exch.FindAppointments(ews.WellKnownFolderName.Calendar, view)
      .then((results) => {
        return exch.LoadPropertiesForItems(results.items, new ews.PropertySet(ews.BasePropertySet.FirstClassProperties, [
          ews.AppointmentSchema.RequiredAttendees
        ]))
      })
      .then((results) => {
        return results.responses
          .map(({item}) => {
            const emails = [].concat(
              item.RequiredAttendees.items.map((emailAddress) => emailAddress.address.trim().toLowerCase()),
              [item.Organizer && item.Organizer.address.trim().toLowerCase()]
            ).filter(e => !(!e))
            const matchingContacts = this.getContactsMatchEmails(contacts, emails)
            if (matchingContacts.length > 0) {
              return this.mapItemToInteraction(item, interactionTypes.APPOINTMENT, 'Start', matchingContacts)
            } else {
              return false
            }
          })
          .filter((interaction) => !(!interaction))
      })
      .catch((error) => {
        if (error.message !== 'The collection is empty.') {
          throw error
        } else {
          return []
        }
      })
  }

  mapItemToInteraction (item, type, dateProp, contacts) {
    return {
      type,
      contacts,
      description: item.Subject,
      externalId: item.Id.UniqueId,
      source: this.getConfigKeyName(),
      date: new Date(item[dateProp].valueOf())
    }
  }

  getConfigKeyName () {
    return 'interactionsyncer_exchange'
  }
}

module.exports = ExchangeInteractionsSyncer

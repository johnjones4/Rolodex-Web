const ews = require('ews-javascript-api')
const EWSFactory = require('../../util/EWSFactory')
const InteractionsSyncer = require('./InteractionsSyncer')

class ExchangeInteractionsSyncer extends InteractionsSyncer {
  getRecentInteractions (contacts) {
    const exch = new EWSFactory().initInstance(this.config.credentials)
    return this.getSearchFolders(exch)
      .then((folderIds) => {
        return Promise.all([
          this.getEmailInteractions(exch, contacts, folderIds)
        ])
      })
      .then((arrayOfArrays) => {
        const final = []
        arrayOfArrays.forEach((array) => {
          array.forEach((obj) => final.push(obj))
        })
        return final
      })
  }

  getSearchFolders (exch) {
    const view = new ews.FolderView()
    view.Traversal = ews.FolderTraversal.Deep
    return exch.FindFolders(ews.WellKnownFolderName.Root, view)
      .then((folders) => {
        return folders.folders.map((folder) => folder.Id)
      })
  }

  getEmailInteractions (exch, contacts, folderIds) {
    const masterSearchGroup = new ews.SearchFilter.SearchFilterCollection()
    masterSearchGroup.LogicalOperator = ews.LogicalOperator.And

    const now = new Date()

    const endDateFilter = new ews.SearchFilter.IsLessThanOrEqualTo()
    endDateFilter.PropertyDefinition = ews.EmailMessageSchema.DateTimeReceived
    endDateFilter.Value = now
    masterSearchGroup.Add(endDateFilter)

    const startDateFilter = new ews.SearchFilter.IsGreaterThanOrEqualTo()
    startDateFilter.PropertyDefinition = ews.EmailMessageSchema.DateTimeReceived
    startDateFilter.Value = new Date(now - (1000 * 60 * 60 * 24 * 7))
    masterSearchGroup.Add(startDateFilter)

    const contactsSearchGroup = new ews.SearchFilter.SearchFilterCollection()
    contactsSearchGroup.LogicalOperator = ews.LogicalOperator.Or
    contacts.forEach((contact) => {
      contact.related('emails').forEach((email) => {
        const fromFilter = new ews.SearchFilter.IsEqualTo()
        fromFilter.PropertyDefinition = ews.EmailMessageSchema.From
        fromFilter.Value = new ews.EmailAddress(email.get('email'))
        contactsSearchGroup.Add(fromFilter)

        // const toFilter = new ews.SearchFilter.IsEqualTo()
        // toFilter.PropertyDefinition = ews.EmailMessageSchema.ToRecipients
        // toFilter.Value = [new ews.EmailAddress(email.get('email'))]
        // searchGroup.Add(toFilter)
      })
    })
    masterSearchGroup.Add(contactsSearchGroup)

    const searchNextFolder = (folderIndex, emails) => {
      if (folderIndex < folderIds.length) {
        const view = new ews.ItemView()
        return exch.FindItems(folderIds[folderIndex], masterSearchGroup, view)
          .then((items) => {
            console.log(items)
            if (items && items.items) {
              items.items.forEach((item) => emails.push(item))
            }
          })
          .then(() => {
            return searchNextFolder(folderIndex + 1, emails)
          })
      } else {
        return Promise.resolve(emails)
      }
    }
    return searchNextFolder(0, [])
      .then((emails) => {
        emails.forEach((email) => {
          console.log(email.propertyBag)
        })
        return []
      })
  }

  getConfigKeyName () {
    return 'interactionsyncer_exchange'
  }
}

module.exports = ExchangeInteractionsSyncer

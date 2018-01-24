const ews = require('ews-javascript-api')
const EWSFactory = require('../../util/EWSFactory')
const ContactsSyncer = require('./ContactsSyncer')
const _ = require('lodash')

class ExchangeContactsSyncer extends ContactsSyncer {
  isReady () {
    return super.isReady() && this.config.credentials
  }

  fetch () {
    const exch = new EWSFactory().initInstance(this.config.credentials)
    const view = new ews.ItemView()
    return exch.FindItems(ews.WellKnownFolderName.Contacts, view)
      .then((results) => {
        if (results && results.items) {
          return results.items
            .filter((record) => !(!record.propertyBag.properties.objects.Id))
            .map((record) => {
              const props = record.propertyBag.properties.objects
              const contact = {
                exchangeId: props.Id.UniqueId,
                name: props.CompleteName.fullName,
                tags: 'Exchange'
              }
              if (props.EmailAddresses) {
                contact.emails = _.values(props.EmailAddresses.entries.objects).map((entry) => entry.emailAddress.address)
              }
              if (props.PhysicalAddresses) {
                contact.locations = _.values(props.PhysicalAddresses.entries.objects).map((entry) => {
                  const loc = []
                  if (entry.propertyBag.items.objects.City) {
                    loc.push(entry.propertyBag.items.objects.City)
                  }
                  if (entry.propertyBag.items.objects.State) {
                    loc.push(entry.propertyBag.items.objects.State)
                  }
                  if (entry.propertyBag.items.objects.CountryOrRegion) {
                    loc.push(entry.propertyBag.items.objects.CountryOrRegion)
                  }
                  return loc.join(', ')
                })
              }
              if (props.PhoneNumbers) {
                contact.phoneNumbers = _.values(props.PhoneNumbers.entries.objects).map((entry) => entry.phoneNumber)
              }
              if (props.CompanyName || props.JobTitle) {
                contact.positions = [
                  {
                    organization: props.CompanyName || null,
                    title: props.JobTitle || null
                  }
                ]
              }
              return contact
            })
        } else {
          return []
        }
      })
  }

  getConfigKeyName () {
    return 'importer_exchange'
  }
}

module.exports = ExchangeContactsSyncer

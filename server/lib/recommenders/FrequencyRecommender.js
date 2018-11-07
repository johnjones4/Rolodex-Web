const Recommender = require('./Recommender')
const _ = require('lodash')

const VALID_UPDATE_FREQUENCIES = {
  monthly: 30 * 26 * 60 * 60 * 1000, // Monthly
  every_two_months: 60 * 26 * 60 * 60 * 1000, // Two Months
  quarterly: 90 * 26 * 60 * 60 * 1000, // Quarterly
  biannually: 180 * 26 * 60 * 60 * 1000, // Biannually
  annually: 365 * 26 * 60 * 60 * 1000 // Annually
}
// const VALID_UPDATE_FREQUENCIES_SERIES = _.values(VALID_UPDATE_FREQUENCIES)

class FrequencyRecommender extends Recommender {
  makeContactRecommendations (contact) {
    const validInteractionDates = contact
      .related('interactions')
      .pluck('date')
      .filter(dateStr => !(!dateStr))
      .map(dateStr => {
        if (typeof dateStr === 'object') {
          return dateStr
        } else {
          return new Date(Date.parse(dateStr))
        }
      })

    if (validInteractionDates.length > 1) {
      validInteractionDates.sort((a, b) => {
        return a.getTime() - b.getTime()
      })

      let interactionFreqTotal = 0
      let interactionFreqCount = validInteractionDates.length
      validInteractionDates.slice(1).forEach((_, i) => {
        const diff = validInteractionDates[i + 1].getTime() - validInteractionDates[i].getTime()
        interactionFreqTotal += diff
      })
      const lastContact = validInteractionDates[validInteractionDates.length - 1].getTime()
      const now = new Date().getTime()
      if (now - lastContact > (30 * 26 * 60 * 60 * 1000)) {
        interactionFreqTotal += (now - lastContact)
        interactionFreqCount++
      }

      const monthlyInteractionMap = {}
      const firstDate = new Date(validInteractionDates[0].getFullYear(), validInteractionDates[0].getMonth(), validInteractionDates[0].getDate(), 0, 0, 0)
      const lastDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
      let curDate = firstDate
      while (curDate.getTime() <= lastDate.getTime()) {
        const mapKey = curDate.getFullYear() + '-' + (curDate.getMonth() + 1)
        monthlyInteractionMap[mapKey] = 0
        let month = curDate.getMonth()
        let year = curDate.getFullYear()
        if (month < 11) {
          month++
        } else {
          month = 0
          year++
        }
        curDate = new Date(year, month, 1, 0, 0, 0, 0)
      }
      validInteractionDates.forEach((interactionDate, index) => {
        const mapKey = interactionDate.getFullYear() + '-' + (interactionDate.getMonth() + 1)
        monthlyInteractionMap[mapKey] = 1
      })
      // _.keys(monthlyInteractionMap).forEach((key, index) => {
      //   const weight = 1 + ((index / (validInteractionDates.length - 1)) * 0.5)
      //   monthlyInteractionMap[key] = monthlyInteractionMap[key] * weight
      // })
      let monthlyTotalsSum = 0
      const monthlyTotals = _.values(monthlyInteractionMap)
      monthlyTotals.forEach(monthlyCounts => {
        monthlyTotalsSum += monthlyCounts
      })

      const avgUpdateFrequency = parseInt(interactionFreqTotal / interactionFreqCount)
      const avgUpdatesPerMonth = monthlyTotalsSum / monthlyTotals.length

      let recUpdateFrequency = null
      // if (avgUpdateFrequency < VALID_UPDATE_FREQUENCIES_SERIES[0]) {
      //   recUpdateFrequency = VALID_UPDATE_FREQUENCIES_SERIES[0]
      // } else if (avgUpdateFrequency > VALID_UPDATE_FREQUENCIES_SERIES[VALID_UPDATE_FREQUENCIES_SERIES.length - 1]) {
      //   recUpdateFrequency = VALID_UPDATE_FREQUENCIES_SERIES[VALID_UPDATE_FREQUENCIES_SERIES.length - 1]
      // } else {
      //   let frequencyIndex = 1
      //   while (recUpdateFrequency === null && frequencyIndex < VALID_UPDATE_FREQUENCIES_SERIES.length) {
      //     if (avgUpdateFrequency >= VALID_UPDATE_FREQUENCIES_SERIES[frequencyIndex - 1] && avgUpdateFrequency <= VALID_UPDATE_FREQUENCIES_SERIES[frequencyIndex]) {
      //       recUpdateFrequency = VALID_UPDATE_FREQUENCIES_SERIES[frequencyIndex]
      //     }
      //     frequencyIndex++
      //   }
      // }
      if (avgUpdatesPerMonth >= 1) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES.monthly
      } else if (avgUpdatesPerMonth >= 0.5) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES.every_two_months
      } else if (avgUpdatesPerMonth >= (1.0 / 3.0)) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES.quarterly
      } else if (avgUpdatesPerMonth >= (1.0 / 6.0)) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES.biannually
      } else if (avgUpdatesPerMonth >= (1.0 / 12.0)) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES.annually
      }

      let updateFrequency = null
      if (contact.get('updateFrequency') === null && recUpdateFrequency !== null) {
        updateFrequency = recUpdateFrequency
      } else if (updateFrequency === null) {
        updateFrequency = contact.get('updateFrequency')
      }

      contact.set({
        avgUpdateFrequency,
        avgUpdatesPerMonth,
        updateFrequency,
        recUpdateFrequency,
        hidden: contact.get('hidden') === false ? false : (avgUpdatesPerMonth < 0.25)
      })

      return contact.save()
    }
    return Promise.resolve()
  }
}

module.exports = FrequencyRecommender

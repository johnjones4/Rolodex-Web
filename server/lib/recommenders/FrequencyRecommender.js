const Recommender = require('./Recommender')
const _ = require('lodash')

const VALID_UPDATE_FREQUENCIES = [
  30 * 26 * 60 * 60 * 1000, // Monthly
  60 * 26 * 60 * 60 * 1000, // Two Months
  90 * 26 * 60 * 60 * 1000, // Quarterly
  180 * 26 * 60 * 60 * 1000, // Biannually
  365 * 26 * 60 * 60 * 1000 // Annually
]

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
      const firstDate = validInteractionDates[0]
      const lastDate = new Date()
      let curDate = firstDate
      while (curDate.getTime() <= lastDate.getTime()) {
        const mapKey = curDate.getFullYear() + '-' + curDate.getMonth()
        monthlyInteractionMap[mapKey] = 0
        let month = curDate.getMonth()
        let year = curDate.getFullYear()
        if (month < 11) {
          month++
        } else {
          month = 0
          year++
        }
        curDate = new Date(year, month, 1)
      }
      validInteractionDates.forEach(interactionDate => {
        const mapKey = interactionDate.getFullYear() + '-' + interactionDate.getMonth()
        monthlyInteractionMap[mapKey]++
      })
      let monthlyTotalsSum = 0
      const monthlyTotals = _.values(monthlyInteractionMap)
      monthlyTotals.forEach(monthlyCounts => {
        monthlyTotalsSum += monthlyCounts
      })

      const avgUpdateFrequency = parseInt(interactionFreqTotal / interactionFreqCount)
      const avgUpdatesPerMonth = monthlyTotalsSum / monthlyTotals.length

      let recUpdateFrequency = null
      if (avgUpdateFrequency < VALID_UPDATE_FREQUENCIES[0]) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES[0]
      } else if (avgUpdateFrequency > VALID_UPDATE_FREQUENCIES[VALID_UPDATE_FREQUENCIES.length - 1]) {
        recUpdateFrequency = VALID_UPDATE_FREQUENCIES[VALID_UPDATE_FREQUENCIES.length - 1]
      } else {
        let frequencyIndex = 1
        while (recUpdateFrequency === null && frequencyIndex < VALID_UPDATE_FREQUENCIES.length) {
          if (avgUpdateFrequency >= VALID_UPDATE_FREQUENCIES[frequencyIndex - 1] && avgUpdateFrequency <= VALID_UPDATE_FREQUENCIES[frequencyIndex]) {
            recUpdateFrequency = VALID_UPDATE_FREQUENCIES[frequencyIndex]
          }
          frequencyIndex++
        }
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
        hidden: contact.get('hidden') === false ? false : (avgUpdatesPerMonth < 1)
      })

      return contact.save()
    }
    return Promise.resolve()
  }
}

module.exports = FrequencyRecommender

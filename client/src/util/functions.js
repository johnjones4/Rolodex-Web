import React from 'react'
import {
  UPDATE_FREQUENCIES
} from './consts'

export const nextInteraction = (contact) => {
  if (contact.hidden) {
    return null
  } else if (!contact.updateFrequency || !contact.interactions || contact.interactions.length === 0) {
    return (<span className='text-danger'>{new Date().toLocaleDateString()}</span>)
  } else {
    const interactions = contact.interactions.slice(0)
    interactions.sort((a, b) => {
      const aDate = a.date.getTime ? a.date.getTime() : (isNaN(a.date) ? Date.parse(a.date) : a.date)
      const bDate = b.date.getTime ? b.date.getTime() : (isNaN(b.date) ? Date.parse(b.date) : b.date)
      return aDate - bDate
    })
    const lastInteraction = interactions[interactions.length - 1]
    const lastDate = lastInteraction.date.getTime ? lastInteraction.date.getTime() : (isNaN(lastInteraction.date) ? Date.parse(lastInteraction.date) : lastInteraction.date)
    const nextDate = new Date(lastDate + (contact.updateFrequency || 0))
    return (<span className={nextDate.getTime() <= (new Date().getTime()) ? 'text-danger' : null}>{nextDate.toLocaleDateString()}</span>)
  }
}

export const updateFrequencyLabel = (millis) => {
  const foundFreq = UPDATE_FREQUENCIES.find((freq) => {
    return freq.value === millis
  })
  if (foundFreq) {
    return foundFreq.label
  } else {
    return null
  }
}

export const recommendationsAvailable = (contact) => {
  return contact.recUpdateFrequency !== null && contact.updateFrequency !== contact.recUpdateFrequency
}

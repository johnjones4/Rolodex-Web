import React from 'react'

export const nextInteraction = (contact) => {
  if (contact.hidden) {
    return null
  } else if (!contact.updateFrequency || !contact.interactions || contact.interactions.length === 0) {
    return (<span className='text-danger'>{new Date().toLocaleDateString()}</span>)
  } else {
    const interactions = contact.interactions.slice(0)
    interactions.sort((a, b) => {
      const aDate = a.date.getTime ? a.date.getTime() : Date.parse(a.date)
      const bDate = b.date.getTime ? b.date.getTime() : Date.parse(b.date)
      return aDate - bDate
    })
    const lastInteraction = interactions[interactions.length - 1]
    const lastDate = lastInteraction.date.getTime ? lastInteraction.date.getTime() : (isNaN(lastInteraction.date) ? Date.parse(lastInteraction.date) : lastInteraction.date)
    const nextDate = new Date(lastDate + (contact.updateFrequency || 0))
    return (<span className={nextDate.getTime() <= (new Date().getTime()) ? 'text-danger' : null}>{nextDate.toLocaleDateString()}</span>)
  }
}

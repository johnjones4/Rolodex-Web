import React from 'react'

export const nextInteraction = (contact) => {
  if (contact.hidden) {
    return null
  } else if (!contact.lastInteraction || !contact.updateFrequency) {
    return (<span className='text-danger'>{new Date().toLocaleDateString()}</span>)
  } else {
    const lastDate = Date.parse(contact.lastInteraction.date)
    const nextDate = new Date(lastDate + contact.updateFrequency)
    return (<span className={nextDate.getTime() <= (new Date().getTime()) ? 'text-danger' : null}>{nextDate.toLocaleDateString()}</span>)
  }
}

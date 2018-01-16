export const ACTIONS = {
  SET_CONTACTS: 'SET_CONTACTS',
  SET_SHOW_HIDDEN: 'SET_SHOW_HIDDEN',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  SET_ACTIVE_CONTACT: 'SET_ACTIVE_CONTACT',
  SET_ISSYNCING: 'SET_ISSYNCING'
}

export const INTERACTION_TYPES = {
  EMAIL_RECEIVED: 'email_received',
  EMAIL_SENT: 'email_sent',
  APPOINTMENT: 'appointment'
}

export const UPDATE_FREQUENCIES = [
  {
    'value': 30 * 26 * 60 * 60 * 1000,
    'label': 'Monthly'
  },
  {
    'value': 60 * 26 * 60 * 60 * 1000,
    'label': 'Every Two Months'
  },
  {
    'value': 90 * 26 * 60 * 60 * 1000,
    'label': 'Quarterly'
  },
  {
    'value': 180 * 26 * 60 * 60 * 1000,
    'label': 'Biannually'
  }
]

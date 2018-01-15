import { combineReducers } from 'redux'
import { ACTIONS } from './consts'

const initialContactsState = {
  'contacts': [],
  'activeContactID': null,
  'showHidden': false
}

const contacts = (state = initialContactsState, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONTACTS:
      return Object.assign({}, state, {
        contacts: action.contacts.slice(0)
      })
    case ACTIONS.SET_SHOW_HIDDEN:
      return Object.assign({}, state, {
        showHidden: action.showHidden
      })
    case ACTIONS.UPDATE_CONTACT:
      const contactIndex = state.contacts.findIndex((contact) => contact.id === action.contact.id)
      if (contactIndex >= 0) {
        const newContactList = state.contacts.slice(0)
        newContactList[contactIndex] = Object.assign({}, action.contact)
        return Object.assign({}, state, {
          contacts: newContactList
        })
      } else {
        return state
      }
    case ACTIONS.SET_ACTIVE_CONTACT:
      return Object.assign({}, state, {
        activeContactID: action.id
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  contacts
})

export default rootReducer

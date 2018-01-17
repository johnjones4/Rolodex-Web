import { combineReducers } from 'redux'
import { ACTIONS } from './consts'

const initialContactsState = {
  'contacts': [],
  'activeContactID': null,
  'showHidden': false
}

const getContactById = (state, id) => {
  return state.contacts.findIndex((contact) => contact.id === id)
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
      const contactIndex = getContactById(state, action.contact.id)
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
    case ACTIONS.UPDATE_NOTE:
      const contactIndex1 = getContactById(state, action.note.contact_id)
      if (contactIndex1 >= 0) {
        const newContactList = state.contacts.slice(0)
        const notes = newContactList[contactIndex1].notes.slice(0)
        const noteIndex = notes.findIndex((note) => note.id === action.note.id)
        if (noteIndex >= 0) {
          notes[noteIndex] = action.note
        } else {
          notes.push(action.note)
        }
        newContactList[contactIndex1] = Object.assign({}, newContactList[contactIndex1], {
          notes
        })
        return Object.assign({}, state, {
          contacts: newContactList
        })
      } else {
        return state
      }
    case ACTIONS.ADD_INTERACTION:
      const contactIndex2 = getContactById(state, action.interaction.contact_id)
      if (contactIndex2 >= 0) {
        const newContactList = state.contacts.slice(0)
        newContactList[contactIndex1] = Object.assign({}, newContactList[contactIndex1], {
          interactions: newContactList[contactIndex1].interactions.concat([action.interaction])
        })
        return Object.assign({}, state, {
          contacts: newContactList
        })
      } else {
        return state
      }
    case ACTIONS.REMOVE_NOTE:
      const contactIndex3 = getContactById(state, action.note.contact_id)
      if (contactIndex3 >= 0) {
        const newContactList = state.contacts.slice(0)
        const notes = newContactList[contactIndex3].notes.slice(0)
        const noteIndex = notes.findIndex((note) => note.id === action.note.id)
        notes.splice(noteIndex, 1)
        newContactList[contactIndex3] = Object.assign({}, newContactList[contactIndex3], {
          notes
        })
        return Object.assign({}, state, {
          contacts: newContactList
        })
      } else {
        return state
      }
    default:
      return state
  }
}

const initialSyncState = {
  isSyncing: false
}

const sync = (state = initialSyncState, action) => {
  switch (action.type) {
    case ACTIONS.SET_ISSYNCING:
      return Object.assign({}, state, {
        isSyncing: action.isSyncing
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  contacts,
  sync
})

export default rootReducer

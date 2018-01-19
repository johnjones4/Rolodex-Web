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
      const contactIds = action.interaction.contacts.map(contact => contact.id)
      const indicies = state.contacts.map((c, i) => i)
      const contactIndexes = indicies.filter((index) => contactIds.indexOf(state.contacts[index].id) >= 0)
      if (contactIndexes.length >= 0) {
        const newContactList = state.contacts.slice(0)
        contactIndexes.forEach((index) => {
          newContactList[index] = Object.assign({}, newContactList[index], {
            interactions: newContactList[index].interactions.concat([action.interaction])
          })
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
  isSyncing: false,
  errors: []
}

const sync = (state = initialSyncState, action) => {
  switch (action.type) {
    case ACTIONS.SET_ISSYNCING:
      return Object.assign({}, state, {
        isSyncing: action.isSyncing,
        errors: action.errors
      })
    default:
      return state
  }
}

const initialConfigState = {
  configs: []
}

const config = (state = initialConfigState, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONFIGS:
      return Object.assign({}, state, {
        configs: action.configs
      })
    case ACTIONS.SET_CONFIG:
      const newConfigs = state.configs.slice(0)
      const configIndex = newConfigs.findIndex((config) => config.key === action.key)
      if (configIndex >= 0) {
        newConfigs[configIndex] = Object.assign({}, newConfigs[configIndex], {
          config: action.config
        })
      } else {
        newConfigs.push({
          key: action.key,
          config: action.config
        })
      }
      return Object.assign({}, state, {
        configs: newConfigs
      })
    case ACTIONS.SET_CONFIG_STRING:
      const newConfigs1 = state.configs.slice(0)
      const configIndex1 = newConfigs1.findIndex((config) => config.key === action.key)
      if (configIndex1 >= 0) {
        newConfigs1[configIndex1] = Object.assign({}, newConfigs1[configIndex1], {
          configString: action.configString
        })
      } else {
        newConfigs1.push({
          key: action.key,
          configString: action.configString,
          config: {}
        })
      }
      return Object.assign({}, state, {
        configs: newConfigs1
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  contacts,
  sync,
  config
})

export default rootReducer

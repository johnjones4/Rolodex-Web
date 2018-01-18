/* global fetch */
import {ACTIONS} from './consts'

export const toggleShowHidden = () => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTIONS.SET_SHOW_HIDDEN,
      showHidden: !getState().contacts.showHidden
    })
    dispatch(loadContacts())
  }
}

export const loadContacts = () => {
  return (dispatch, getState) => {
    fetch('/api/contact' + (getState().contacts.showHidden ? '?showHidden=1' : ''))
      .then((res) => res.json())
      .then((contacts) => {
        dispatch({
          type: ACTIONS.SET_CONTACTS,
          contacts
        })
      })
      .catch(err => console.error(err))
  }
}

export const updateContact = (contact, updateProps) => {
  return (dispatch, getState) => {
    const newContact = Object.assign({}, contact, updateProps)
    fetch('/api/contact/' + newContact.id, {
      method: 'POST',
      body: JSON.stringify(newContact),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((contact) => {
        dispatch({
          type: ACTIONS.UPDATE_CONTACT,
          contact
        })
      })
      .catch(err => console.error(err))
  }
}

export const setActiveContact = (contact) => {
  return {
    type: ACTIONS.SET_ACTIVE_CONTACT,
    id: contact.id
  }
}

export const checkSyncing = () => {
  return (dispatch, getState) => {
    fetch('/api/sync')
      .then((res) => res.json())
      .then(({isSyncing}) => {
        dispatch({
          type: ACTIONS.SET_ISSYNCING,
          isSyncing
        })
      })
      .catch(err => console.error(err))
  }
}

export const startSyncing = () => {
  return (dispatch, getState) => {
    fetch('/api/sync', {
      method: 'POST'
    })
      .then((res) => res.json())
      .then(({isSyncing}) => {
        dispatch({
          type: ACTIONS.SET_ISSYNCING,
          isSyncing
        })
      })
      .catch(err => console.error(err))
  }
}

export const updateNote = (note) => {
  return (dispatch, getState) => {
    fetch('/api/note' + (note.id >= 0 ? '/' + note.id : ''), {
      method: note.id >= 0 ? 'POST' : 'PUT',
      body: JSON.stringify(note),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((note) => {
        dispatch({
          type: ACTIONS.UPDATE_NOTE,
          note
        })
      })
      .catch(err => console.error(err))
  }
}

export const deleteNote = (note) => {
  return (dispatch, getState) => {
    fetch('/api/note' + (note.id >= 0 ? '/' + note.id : ''), {
      method: 'DELETE'
    })
      .then(() => {
        dispatch({
          type: ACTIONS.REMOVE_NOTE,
          note
        })
      })
      .catch(err => console.error(err))
  }
}

export const addInteraction = (interaction) => {
  return (dispatch, getState) => {
    fetch('/api/interaction', {
      method: 'PUT',
      body: JSON.stringify(interaction),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((interaction) => {
        dispatch({
          type: ACTIONS.ADD_INTERACTION,
          interaction
        })
      })
      .catch(err => console.error(err))
  }
}

export const loadConfigs = () => {
  return (dispatch, getState) => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((configs) => {
        dispatch({
          type: ACTIONS.SET_CONFIGS,
          configs
        })
      })
      .catch(err => console.error(err))
  }
}

export const setConfig = (key, config) => {
  return {
    type: ACTIONS.SET_CONFIG,
    key,
    config
  }
}

export const setConfigString = (key, configString) => {
  return {
    type: ACTIONS.SET_CONFIG_STRING,
    key,
    configString
  }
}

export const saveConfigs = () => {
  return (dispatch, getState) => {
    Promise.all(
      getState().config.configs
        .filter((config) => config.key !== 'importer_googlecontacts')
        .map((config) => {
          const configDupe = Object.assign({}, config)
          delete configDupe.configString
          return fetch('/api/config' + (config.id >= 0 ? '/' + config.id : ''), {
            method: config.id >= 0 ? 'POST' : 'PUT',
            body: JSON.stringify(configDupe),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })
        })
    )
      .then(() => {
        return dispatch(loadConfigs())
      })
      .catch(err => console.error(err))
  }
}

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
  }
}
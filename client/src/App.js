import React, { Component } from 'react'
import './variables.scss'
import './bootstrap/scss/bootstrap.scss'
import 'font-awesome/css/font-awesome.css'
import './App.scss'
import Toolbar from './components/Toolbar'
import ContactList from './components/ContactList'
import ContactDetailView from './components/ContactDetailView'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class App extends Component {
  render () {
    return (
      <div className='app-wrapper'>
        <Toolbar />
        <ContactList />
        <ContactDetailView />
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  }, dispatch)
}

export default connect(stateToProps, dispatchToProps)(App)

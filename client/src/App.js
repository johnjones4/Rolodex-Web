import React, { Component } from 'react'
import './variables.scss'
import './bootstrap/scss/bootstrap.scss'
import 'font-awesome/css/font-awesome.css'
import './App.scss'
import Toolbar from './features/Toolbar'
import ContactList from './features/ContactList'
import ContactDetailView from './features/ContactDetailView'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modal: false
    }
    setTimeout(() => {
      this.setState({modal: true})
    }, 1000)
  }

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

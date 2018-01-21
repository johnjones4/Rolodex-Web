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
import Login from './Login'
import PropTypes from 'prop-types'

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
    if (this.props.user.token) {
      return (
        <div className='app-wrapper'>
          <Toolbar />
          <ContactList />
          <ContactDetailView />
        </div>
      )
    } else {
      return (<Login />)
    }
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts,
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  }, dispatch)
}

App.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

export default connect(stateToProps, dispatchToProps)(App)

import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './Login.scss'
import {
  login
} from './util/actions'
import PropTypes from 'prop-types'
import {
  Input,
  Label,
  Button
} from 'reactstrap'

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  render () {
    return (
      <form className='form-signin' onSubmit={(event) => this.doLogin(event)}>
        <h1 className='h3 mb-3 font-weight-normal'>Please sign in</h1>
        <Label htmlFor='username' className='sr-only'>Email address</Label>
        <Input type='text' id='username' placeholder='Username' value={this.state.username} onChange={(event) => this.setState({username: event.target.value})} />
        <Label htmlFor='password' className='sr-only'>Password</Label>
        <Input type='password' id='password' placeholder='Password' value={this.state.password} onChange={(event) => this.setState({password: event.target.value})} />
        <Button size='lg' color='primary' className='btn-block' type='submit'>Sign in</Button>
      </form>
    )
  }

  doLogin (event) {
    event.preventDefault()
    this.props.login(this.state.username, this.state.password)
    return false
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    login
  }, dispatch)
}

Login.propTypes = {
  login: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Login)

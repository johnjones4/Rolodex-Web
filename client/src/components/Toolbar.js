import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './Toolbar.scss'
import FontAwesome from 'react-fontawesome'
import {
  Button,
  ButtonGroup
} from 'reactstrap'
import PropTypes from 'prop-types'
import {
  toggleShowHidden
} from '../util/actions'

class Toolbar extends Component {
  render () {
    return (
      <div className='toolbar'>
        <ButtonGroup vertical>
          <Button color='primary' onClick={() => this.props.toggleShowHidden()} title='Show/Hide tracked contacts'>
            <FontAwesome name={this.props.contacts.showHidden ? 'star-o' : 'star'} />
          </Button>
          <Button color='primary' title='Settings'>
            <FontAwesome name='gear' />
          </Button>
        </ButtonGroup>
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
    toggleShowHidden
  }, dispatch)
}

Toolbar.propTypes = {
  contacts: PropTypes.shape({
    showHidden: PropTypes.bool
  }),
  toggleShowHidden: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Toolbar)

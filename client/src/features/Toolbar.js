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
  toggleShowHidden,
  checkSyncing,
  startSyncing,
  loadContacts
} from '../util/actions'
import Settings from '../components/Settings'

class Toolbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      settingsOpen: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.sync.isSyncing) {
      setTimeout(() => {
        this.props.checkSyncing()
      }, 5000)
    } else if (!nextProps.sync.isSyncing && this.props.sync.isSyncing) {
      this.props.loadContacts()
    }
  }

  componentDidMount () {
    this.props.checkSyncing()
  }

  render () {
    return (
      <div className='toolbar'>
        <ButtonGroup vertical>
          <Button color='secondary' onClick={() => this.props.toggleShowHidden()} title='Show/Hide tracked contacts'>
            <FontAwesome name={this.props.contacts.showHidden ? 'star-o' : 'star'} />
          </Button>
          <Button color='secondary' title='Settings' onClick={() => this.setState({settingsOpen: true})}>
            <FontAwesome name='gear' />
          </Button>
          <Button color='secondary' title='Sync data' onClick={() => this.props.startSyncing()}>
            <FontAwesome name='refresh' className={this.props.sync.isSyncing ? 'sync-running' : ''} />
          </Button>
        </ButtonGroup>
        <Settings isOpen={this.state.settingsOpen} toggle={() => this.setState({settingsOpen: !this.state.settingsOpen})} />
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts,
    sync: state.sync
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    toggleShowHidden,
    checkSyncing,
    startSyncing,
    loadContacts
  }, dispatch)
}

Toolbar.propTypes = {
  contacts: PropTypes.shape({
    showHidden: PropTypes.bool
  }),
  sync: PropTypes.shape({
    isSyncing: PropTypes.bool
  }),
  checkSyncing: PropTypes.func,
  startSyncing: PropTypes.func,
  toggleShowHidden: PropTypes.func,
  loadContacts: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Toolbar)

import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './Toolbar.scss'
import FontAwesome from 'react-fontawesome'
import {
  Button,
  ButtonGroup,
  Alert
} from 'reactstrap'
import PropTypes from 'prop-types'
import {
  toggleShowHidden,
  checkSyncing,
  startSyncing,
  loadContacts,
  logout
} from '../util/actions'
import {
  MOBILE_SIZE
} from '../util/consts'
import Settings from '../components/Settings'

class Toolbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      settingsOpen: false,
      toolbarVertical: window.innerWidth >= MOBILE_SIZE
    }
    window.addEventListener('resize', () => {
      this.setState({
        toolbarVertical: window.innerWidth >= MOBILE_SIZE
      })
    })
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
      <div>
        <div className='toolbar'>
          <ButtonGroup vertical={this.state.toolbarVertical}>
            <Button color='secondary' onClick={() => this.props.toggleShowHidden()} title='Show/Hide tracked contacts'>
              <FontAwesome name={this.props.contacts.showHidden ? 'star-o' : 'star'} />
            </Button>
            <Button color='secondary' title='Settings' onClick={() => this.setState({settingsOpen: true})}>
              <FontAwesome name='gear' />
            </Button>
            <Button color='primary' title='Sync data' onClick={() => this.props.startSyncing()}>
              <FontAwesome name='refresh' className={this.props.sync.isSyncing ? 'sync-running' : ''} />
            </Button>
            <Button color='warning' title='Log Out' onClick={() => this.props.logout()}>
              <FontAwesome name='sign-out' />
            </Button>
          </ButtonGroup>
        </div>
        <Settings isOpen={this.state.settingsOpen} toggle={() => this.setState({settingsOpen: !this.state.settingsOpen})} />
        { this.props.sync.errors && this.props.sync.errors.length ? (
          <Alert color='danger' className='sync-alert'>
            {
              this.props.sync.errors.map((error, i) => (<p key={i}>{error}</p>))
            }
          </Alert>
        ) : null }
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
    loadContacts,
    logout
  }, dispatch)
}

Toolbar.propTypes = {
  contacts: PropTypes.shape({
    showHidden: PropTypes.bool
  }),
  sync: PropTypes.shape({
    isSyncing: PropTypes.bool,
    errors: PropTypes.array
  }),
  checkSyncing: PropTypes.func,
  startSyncing: PropTypes.func,
  toggleShowHidden: PropTypes.func,
  loadContacts: PropTypes.func,
  logout: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Toolbar)

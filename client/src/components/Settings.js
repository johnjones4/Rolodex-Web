import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  FormGroup,
  Input,
  Label
} from 'reactstrap'

const TABS = [
  {
    key: 'importer_exchange',
    value: 'Exchange Contacts'
  },
  {
    key: 'importer_googlecontacts',
    value: 'Google Contacts'
  },
  {
    key: 'interactionsyncer_exchange',
    value: 'Exchange Mail and Calendar'
  },
  {
    key: 'interactionsyncer_imap',
    value: 'IMAP Mail'
  }
]

class Settings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: TABS[0].key
    }
  }
  render () {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size='lg'>
        <ModalHeader toggle={this.props.toggle}>Settings</ModalHeader>
        <ModalBody>
          <Nav tabs>
            {
              TABS.map((tab) => {
                return (
                  <NavItem key={tab.key}>
                    <NavLink
                      className={this.state.activeTab === tab.key ? 'active' : ''}
                      onClick={() => this.setState({activeTab: tab.key})}>
                      {tab.value}
                    </NavLink>
                  </NavItem>
                )
              })
            }
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            {this.renderImporterExchange()}
          </TabContent>
        </ModalBody>
        <ModalFooter>
          Footer
        </ModalFooter>
      </Modal>
    )
  }

  renderImporterExchange () {
    return (
      <TabPane key='importer_exchange' id='importer_exchange'>
        <FormGroup>
          <Label>Server URL</Label>
          <Input type='text' />
        </FormGroup>
        <FormGroup>
          <Label>Username</Label>
          <Input type='text' />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input type='password' />
        </FormGroup>
      </TabPane>
    )
  }
}

const stateToProps = (state) => {
  return {
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  }, dispatch)
}

Settings.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Settings)

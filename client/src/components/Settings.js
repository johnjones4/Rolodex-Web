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
  Label,
  Button,
  InputGroup,
  InputGroupAddon
} from 'reactstrap'
import {
  loadConfigs,
  setConfigString,
  setConfig,
  saveConfigs,
  uploadLinkedInFile
} from '../util/actions'
import './Settings.scss'

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
  },
  {
    key: 'importer_linkedin',
    value: 'LinkedIn Connections'
  }
]

class Settings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: TABS[0].key,
      selectedLinkedInFile: null
    }
  }

  componentWillMount () {
    this.props.loadConfigs()
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
          <br />
          <TabContent activeTab={this.state.activeTab}>
            {
              TABS.map((tab) => {
                const config = this.props.config.configs.find((config) => config.key === tab.key) || {config: {}, key: tab.key}
                return config && (
                  <TabPane key={tab.key} tabId={tab.key}>
                    {this.renderSettingsTab(config)}
                  </TabPane>
                )
              })
            }
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={() => this.commitChanges()}>Save All</Button>{' '}
          <Button color='secondary' onClick={this.props.toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }

  renderSettingsTab (config) {
    switch (config.key) {
      case 'importer_linkedin':
        const handleLinkedInFileUpload = () => {
          this.props.uploadLinkedInFile(this.state.selectedLinkedInFile)
          this.setState({selectedLinkedInFile: null})
        }
        return (
          <FormGroup>
            <Label>Connections CSV</Label>
            <InputGroup>
              <Input type='file' onChange={(event) => this.setState({selectedLinkedInFile: event.target.files[0]})} />
              <InputGroupAddon>
                <Button color='success' disabled={!this.state.selectedLinkedInFile} onClick={() => handleLinkedInFileUpload()}>Upload</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
        )
      case 'importer_googlecontacts':
        return (<a href='/auth/googlecontacts' target='_blank' className='btn btn-success'>
          {config && config.config && config.config.accessToken ? 'Reauthorize Google' : 'Authorize Google'}
        </a>)
      default:
        const configStr = config ? (config.configString || JSON.stringify(config.config, null, '  ')) : ''
        return (<FormGroup>
          <Label>Settings</Label>
          <Input
            className='settings-json'
            type='textarea'
            value={configStr}
            onChange={(event) => this.props.setConfigString(config.key, event.target.value)} />
        </FormGroup>)
    }
  }

  commitChanges () {
    TABS.forEach((tab) => {
      const config = this.props.config.configs.find((config) => config.key === tab.key)
      if (config && config.configString) {
        try {
          this.props.setConfig(tab.key, JSON.parse(config.configString))
        } catch (e) {}
      }
    })
    this.props.saveConfigs()
    this.props.toggle()
  }
}

const stateToProps = (state) => {
  return {
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadConfigs,
    setConfigString,
    setConfig,
    saveConfigs,
    uploadLinkedInFile
  }, dispatch)
}

Settings.propTypes = {
  config: PropTypes.shape({
    configs: PropTypes.array
  }),
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  loadConfigs: PropTypes.func,
  setConfigString: PropTypes.func,
  setConfig: PropTypes.func,
  saveConfigs: PropTypes.func,
  uploadLinkedInFile: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Settings)

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
      case 'importer_exchange':
      case 'interactionsyncer_exchange':
        return (
          <div>
            {
              [
                {
                  label: 'Server URL',
                  property: 'credentials',
                  subProperty: 'url'
                },
                {
                  label: 'Username',
                  property: 'credentials',
                  subProperty: 'username'
                },
                {
                  label: 'Password',
                  property: 'credentials',
                  subProperty: 'password',
                  type: 'password'
                }
              ].map((field) => this.renderSettingsForm(field.label, config, field.property, field.subProperty, field.type || 'text'))
            }
          </div>
        )
      case 'interactionsyncer_imap':
        return (
          <div>
            {
              [
                {
                  label: 'Host',
                  property: 'credentials',
                  subProperty: 'host'
                },
                {
                  label: 'Port',
                  property: 'credentials',
                  subProperty: 'port',
                  type: 'number'
                },
                {
                  label: 'TLS',
                  property: 'credentials',
                  subProperty: 'tls',
                  type: 'checkbox'
                },
                {
                  label: 'Username',
                  property: 'credentials',
                  subProperty: 'user'
                },
                {
                  label: 'Password',
                  property: 'credentials',
                  subProperty: 'password',
                  type: 'password'
                },
                {
                  label: 'Inbox Name',
                  property: 'mailboxes',
                  subProperty: 'inbox'
                },
                {
                  label: 'Sent Mailbox Name',
                  property: 'mailboxes',
                  subProperty: 'sent'
                }
              ].map((field) => this.renderSettingsForm(field.label, config, field.property, field.subProperty, field.type || 'text'))
            }
          </div>
        )
      case 'importer_googlecontacts':
        return (<a href='/auth/googlecontacts' target='_blank' className='btn btn-success'>
          {config && config.config && config.config.accessToken ? 'Reauthorize Google' : 'Authorize Google'}
        </a>)
      default:
        return null
    }
  }

  renderSettingsForm (label, config, property, subProperty, type) {
    const setValue = (event) => {
      switch (type) {
        case 'checkbox':
          this.updateSettingSubProperty(config, property, subProperty, event.target.checked)
          break
        case 'number':
          this.updateSettingSubProperty(config, property, subProperty, parseInt(event.target.value))
          break
        default:
          this.updateSettingSubProperty(config, property, subProperty, event.target.value)
      }
    }
    switch (type) {
      case 'checkbox':
        return (
          <FormGroup check key={[property, subProperty].join('-')}>
            <Label check><Input type={type} checked={type === 'checkbox' && (config.config[property] ? config.config[property][subProperty] : false)} onChange={(event) => setValue(event)} /> {label}</Label>
            <br /><br />
          </FormGroup>
        )
      default:
        return (
          <FormGroup key={[property, subProperty].join('-')}>
            <Label>{label}</Label>
            <Input type={type} value={config.config[property] ? config.config[property][subProperty] : ''} onChange={(event) => setValue(event)} />
          </FormGroup>
        )
    }
  }

  updateSettingSubProperty (config, property, subProperty, value) {
    if (!config.config[property]) {
      config.config[property] = {}
    }
    config.config[property][subProperty] = value
    this.props.setConfig(config.key, config.config)
  }

  commitChanges () {
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
  setConfig: PropTypes.func,
  saveConfigs: PropTypes.func,
  uploadLinkedInFile: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(Settings)

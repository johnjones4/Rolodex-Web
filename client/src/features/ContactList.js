import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './ContactList.scss'
import {
  loadContacts,
  updateContact,
  setActiveContact,
  loadTags
} from '../util/actions'
import PropTypes from 'prop-types'
import {
  Table,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  Col
} from 'reactstrap'
import FontAwesome from 'react-fontawesome'
import {
  nextInteraction
} from '../util/functions'

class ContactList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchStr: '',
      searchTag: ''
    }
  }

  componentDidMount () {
    this.props.loadContacts()
    this.props.loadTags()
  }

  contactsList () {
    let contacts = this.props.contacts.contacts
    if (this.state.searchStr && this.state.searchStr.trim().length > 0) {
      contacts = contacts.filter((contact) => contact.name.toLowerCase().indexOf(this.state.searchStr.toLowerCase()) >= 0)
    }
    if (this.state.searchTag && this.state.searchTag.trim().length > 0) {
      contacts = contacts.filter((contact) => {
        return contact.tags.findIndex((tag) => tag.tag === this.state.searchTag) >= 0
      })
    }
    return contacts
  }

  render () {
    return (
      <div className={['contact-list', this.props.contacts.contactsLoading ? 'contacts-loading' : ''].join(' ')}>
        <div className='contacts-list-search'>
          <Row>
            <Col>
              <InputGroup>
                <Input type='text' placeholder='Search Names' value={this.state.searchStr} onChange={(event) => this.setState({searchStr: event.target.value})} />
                { (this.state.searchStr && this.state.searchStr.trim().length > 0) && (
                  <InputGroupAddon addonType='append'>
                    <Button color='light' onClick={() => this.setState({searchStr: ''})}>
                      <FontAwesome name='times' />
                    </Button>
                  </InputGroupAddon>
                ) }
              </InputGroup>
            </Col>
            <Col>
              <InputGroup>
                <Input type='select' value={this.state.searchTag} onChange={(event) => event.target.selectedIndex > 0 && this.setState({searchTag: this.props.tags.tags[event.target.selectedIndex - 1].tag})}>
                  <option>Select a Tag</option>
                  { this.props.tags.tags.map((tag, i) => (<option value={tag.tag} key={i}>{tag.tag}</option>)) }
                </Input>
                { (this.state.searchTag && this.state.searchTag.trim().length > 0) && (
                  <InputGroupAddon addonType='append'>
                    <Button color='light' onClick={() => this.setState({searchTag: ''})}>
                      <FontAwesome name='times' />
                    </Button>
                  </InputGroupAddon>
                ) }
              </InputGroup>
            </Col>
          </Row>
        </div>
        <div className='contacts-list-wrapper'>
          <Table size='sm' bordered hover className='border-0'>
            <thead>
              <tr>
                <th>Name</th>
                <th className='client-list-next-interaction-column text-center'>Last Interaction</th>
                <th className='client-list-tracking-column text-center'>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {
                this.contactsList().map((contact) => {
                  return (
                    <tr key={contact.id} className={['contant-list-item', (this.props.contacts.activeContactID === contact.id ? 'contact-list-item-selected' : '')].join(' ')} onClick={() => this.props.setActiveContact(contact)}>
                      <td className='contacts-list-name'>{contact.name}</td>
                      <td className='contacts-list-next-interaction text-center'>{nextInteraction(contact)}</td>
                      <td className='contacts-list-hidden-toggle text-center'>
                        <Button className='border' color='light' size='sm' onClick={() => this.props.updateContact(contact, {hidden: !contact.hidden})}>
                          <FontAwesome name={contact.hidden ? 'star-o' : 'star'} />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </div>
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts,
    tags: state.tags
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadContacts,
    updateContact,
    setActiveContact,
    loadTags
  }, dispatch)
}

ContactList.propTypes = {
  contacts: PropTypes.shape({
    contacts: PropTypes.array,
    activeContactID: PropTypes.number,
    contactsLoading: PropTypes.bool
  }),
  tags: PropTypes.shape({
    tags: PropTypes.array
  }),
  loadContacts: PropTypes.func,
  updateContact: PropTypes.func,
  setActiveContact: PropTypes.func,
  loadTags: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(ContactList)

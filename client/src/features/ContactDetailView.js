import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './ContactDetailView.scss'
import PropTypes from 'prop-types'
import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  Button
} from 'reactstrap'
import {
  INTERACTION_TYPES_STRINGS,
  UPDATE_FREQUENCIES
} from '../util/consts'
import {
  updateContact
} from '../util/actions'
import FontAwesome from 'react-fontawesome'
import AddInteraction from '../components/AddInteraction'
import NoteEditor from '../components/NoteEditor'
import marked from 'marked'

class ContactDetailView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      newInteraction: null,
      newNote: null,
      editingNote: null,
      editingInteractionNote: null
    }
  }

  render () {
    const contact = this.getContact()
    return (
      <div className='contact-detail-view'>
        {
          contact && (
            <div className='contact-detail-view-content'>
              { this.renderHeading(contact) }
              <hr />
              { this.renderPreferences(contact) }
              <hr />
              { this.renderDetails(contact) }
              <hr />
              { this.renderTimeline(contact) }
            </div>
          )
        }
      </div>
    )
  }

  renderHeading (contact) {
    return (
      <div className='contact-detail-view-heading'>
        { contact.photos && contact.photos.length > 0 && (<img src={contact.photos[0].url} alt={contact.name} className='pull-left profile-photo' />) }
        <h1>
          {contact.name}
        </h1>
        {
          contact.positions.length > 0 && (
            <h2>
              <small className='text-muted'>
                {
                  contact.positions.map((position) => {
                    return [
                      position.title,
                      position.organization && position.organization.name
                    ].filter(str => !(!str)).join(', ')
                  }).join('; ')
                }
              </small>
            </h2>
          )
        }
      </div>
    )
  }

  renderPreferences (contact) {
    return (
      <div className='contact-detail-view-preferences'>
        <h3>Preferences</h3>
        <FormGroup row>
          <Label sm={4}>Outreach Frequency</Label>
          <Col sm={8}>
            <Input
              type='select'
              value={contact.updateFrequency || ''}
              onChange={(event) => this.props.updateContact(contact, {updateFrequency: (event.target.selectedIndex > 0 ? UPDATE_FREQUENCIES[event.target.selectedIndex - 1].value : null)})}>
              <option value=''>Select One</option>
              { UPDATE_FREQUENCIES.map(freq => (<option key={freq.value} value={freq.value}>{freq.label}</option>))}
            </Input>
          </Col>
        </FormGroup>
      </div>
    )
  }

  renderDetails (contact) {
    return (
      <div className='contact-detail-view-details'>
        <h3>Contact Information</h3>
        <Row>
          <Col>
            <h3>Emails</h3>
            <ul className='contact-detail-view-list'>
              {
                contact.emails.map(email => (<li key={email.id}><a href={'mailto:' + email.email} target='_blank'>{email.email}</a></li>))
              }
            </ul>
          </Col>
          <Col>
            <h3>Phone Numbers</h3>
            <ul className='contact-detail-view-list'>
              {
                contact.phoneNumbers.map(phone => (<li key={phone.id}>{phone.phone}</li>))
              }
            </ul>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <h3>URLs</h3>
            <ul className='contact-detail-view-list'>
              {
                contact.urls.map(url => (<li key={url.id}><a href={url.url} target='_blank'>{url.url}</a></li>))
              }
            </ul>
          </Col>
          <Col>
            <h3>Locations</h3>
            <ul className='contact-detail-view-list'>
              {
                contact.locations.map((location, i) => (<li key={i}>{location.description}</li>))
              }
            </ul>
          </Col>
        </Row>
      </div>
    )
  }

  addNote () {
    this.setState({
      newNote: {
        contact_id: this.props.contacts.activeContactID,
        note: ''
      },
      newInteraction: null,
      editingNote: null
    })
  }

  addInteraction (contact) {
    this.setState({
      newInteraction: {
        contacts: [contact],
        source: 'manual',
        external_id: new Date().getTime()
      },
      newNote: null,
      editingNote: null
    })
  }

  editNote (note) {
    this.setState({
      newInteraction: null,
      newNote: null,
      editingNote: note.id
    })
  }

  renderTimeline (contact) {
    const events = this.generateTimeline(contact)
    return (
      <div className='contact-detail-view-timeline'>
        <h3>Timeline</h3>
        <div className='text-center'>
          <ButtonGroup>
            <Button color='success' onClick={() => this.addNote()} className={this.state.newNote ? 'active' : ''}>
              <FontAwesome name='sticky-note' /> Add Note
            </Button>
            <Button color='success' onClick={() => this.addInteraction(contact)} className={this.state.newInteraction ? 'active' : ''}>
              <FontAwesome name='users' /> Add Interaction
            </Button>
          </ButtonGroup>
        </div>
        <ListGroup>
          {
            this.state.newNote && (
              <ListGroupItem>
                <NoteEditor note={this.state.newNote} done={() => this.setState({newNote: null})} />
              </ListGroupItem>
            )
          }
          {
            this.state.newInteraction && (
              <ListGroupItem>
                <AddInteraction interaction={this.state.newInteraction} done={() => this.setState({newInteraction: null})} />
              </ListGroupItem>
            )
          }
          {
            events.map((event, i) => {
              return (
                <ListGroupItem key={i} className='flex-column align-items-start'>
                  <div className='d-flex w-100 justify-content-between'>
                    <ListGroupItemHeading>
                      {event.heading}
                    </ListGroupItemHeading>
                    <small>
                      {event.date.toLocaleDateString()}
                    </small>
                  </div>
                  { this.renderTimelineBody(event) }
                </ListGroupItem>
              )
            })
          }
        </ListGroup>
      </div>
    )
  }

  renderTimelineBody (event) {
    switch (event.type) {
      case 'note':
        if (this.state.editingNote !== event.note.id) {
          return (
            <ListGroupItemText onClick={() => this.editNote(event.note)}>
              <div dangerouslySetInnerHTML={{__html: marked(event.note.note)}} />
              <small className='click-to-edit'>Click to edit</small>
            </ListGroupItemText>
          )
        } else {
          return (<NoteEditor note={event.note} done={() => this.setState({editingNote: null})} />)
        }
      case 'interaction':
      default:
        return null
    }
  }

  generateTimeline (contact) {
    const events = contact.interactions.map((interaction) => {
      return {
        'type': 'interaction',
        'date': new Date(interaction.date),
        'heading': (
          <span>
            <strong>{INTERACTION_TYPES_STRINGS[interaction]}</strong>
            {interaction.description}
          </span>
        ),
        interaction
      }
    }).concat(contact.notes.map((note) => {
      return {
        'type': 'note',
        'date': new Date(note.created_at),
        'heading': 'Note',
        note
      }
    }))
    events.sort((a, b) => {
      return b.date.getTime() - a.date.getTime()
    })
    return events
  }

  getContact () {
    return this.props.contacts.contacts.find((contact) => contact.id === this.props.contacts.activeContactID)
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateContact
  }, dispatch)
}

ContactDetailView.propTypes = {
  contacts: PropTypes.shape({
    contacts: PropTypes.array,
    activeContactID: PropTypes.number
  }),
  updateContact: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(ContactDetailView)

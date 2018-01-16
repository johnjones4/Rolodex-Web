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
  INTERACTION_TYPES,
  UPDATE_FREQUENCIES
} from '../util/consts'
import {
  updateContact
} from '../util/actions'
import FontAwesome from 'react-fontawesome'

class ContactDetailView extends Component {
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
          <Label sm={4}>Update Frequency</Label>
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

  renderTimeline (contact) {
    const events = this.generateTimeline(contact)
    return (
      <div className='contact-detail-view-timeline'>
        <h3>Timeline</h3>
        <div>
          <ButtonGroup size='sm'>
            <Button color='success'>
              <FontAwesome name='sticky-note' /> Add Note
            </Button>
            <Button color='success'>
              <FontAwesome name='users' /> Add Interaction
            </Button>
          </ButtonGroup>
        </div>
        <ListGroup>
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
                  { event.type === 'note' &&
                    <ListGroupItemText>
                      {event.note.note}
                    </ListGroupItemText>
                  }
                </ListGroupItem>
              )
            })
          }
        </ListGroup>
      </div>
    )
  }

  generateTimeline (contact) {
    const interactionHeadingPrefix = (interaction) => {
      switch (interaction.type) {
        case INTERACTION_TYPES.APPOINTMENT:
          return 'Meeting: '
        case INTERACTION_TYPES.EMAIL_RECEIVED:
          return 'Email Received: '
        case INTERACTION_TYPES.EMAIL_SENT:
          return 'Email Sent: '
        default:
          return ''
      }
    }
    const events = contact.interactions.map((interaction) => {
      return {
        'type': 'interaction',
        'date': new Date(interaction.date),
        'heading': (
          <span>
            <strong>{interactionHeadingPrefix(interaction)}</strong>
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

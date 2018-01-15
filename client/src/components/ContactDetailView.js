import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './ContactDetailView.scss'
import PropTypes from 'prop-types'
import {
  Row,
  Col
} from 'reactstrap'

class ContactDetailView extends Component {
  render () {
    const contact = this.getContact()
    return (
      <div className='contact-detail-view'>
        {
          contact && (
            <div className='contact-detail-view-content'>
              <h1>{contact.name}</h1>
              <hr />
              <h2 className='sr-only'>Contact Information</h2>
              <Row>
                <Col>
                  <h3>Emails</h3>
                  <ul className='contact-detail-view-list'>
                    {
                      contact.emails.map(email => (<li>{email.email}</li>))
                    }
                  </ul>
                </Col>
                <Col>
                  <h3>Phone Numbers</h3>
                  <ul className='contact-detail-view-list'>
                    {
                      contact.phoneNumbers.map(phone => (<li>{phone.phone}</li>))
                    }
                  </ul>
                </Col>
              </Row>
            </div>
          )
        }
      </div>
    )
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
  }, dispatch)
}

ContactDetailView.propTypes = {
  contacts: PropTypes.shape({
    contacts: PropTypes.array,
    activeContactID: PropTypes.bool
  })
}

export default connect(stateToProps, dispatchToProps)(ContactDetailView)

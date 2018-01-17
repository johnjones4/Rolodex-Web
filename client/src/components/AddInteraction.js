import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  addInteraction
} from '../util/actions'
import {
  INTERACTION_TYPES_STRINGS
} from '../util/consts'
import {
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap'
import _ from 'lodash'

class AddInteraction extends Component {
  constructor (props) {
    super(props)
    this.state = {
      type: null,
      date: new Date(),
      description: ''
    }
  }

  render () {
    return (
      <div>
        <FormGroup>
          <Label>Type</Label>
          <Input type='select' value={this.state.type} onChange={(event) => this.setState({type: (event.target.selectedIndex > 0 ? _.keys(INTERACTION_TYPES_STRINGS)[event.target.selectedIndex - 1] : null)})}>
            <option>Select One</option>
            { _.keys(INTERACTION_TYPES_STRINGS).map((key, i) => (<option key={key} value={key}>{INTERACTION_TYPES_STRINGS[key]}</option>))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <Input type='textarea' value={this.state.description} onChange={(event) => this.setState({description: event.target.value})} />
        </FormGroup>
        <div>
          <Button color='primary' onClick={() => this.saveInteraction()}>Save</Button>{' '}
          <Button color='secondary' onClick={() => this.props.done()}>Cancel</Button>{' '}
        </div>
      </div>
    )
  }

  saveInteraction () {
    const interaction = Object.assign({}, this.props.interaction, {
      type: this.state.type,
      date: this.state.date,
      description: this.state.description
    })
    this.props.addInteraction(interaction)
    this.props.done()
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    addInteraction
  }, dispatch)
}

AddInteraction.propTypes = {
  addInteraction: PropTypes.func,
  done: PropTypes.func,
  interaction: PropTypes.object
}

export default connect(stateToProps, dispatchToProps)(AddInteraction)

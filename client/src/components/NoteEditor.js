import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  updateNote,
  deleteNote
} from '../util/actions'
import {
  Button,
  FormGroup,
  Label,
  Input
} from 'reactstrap'

class NoteEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      noteText: props.note.note
    }
  }

  render () {
    return (
      <div>
        <FormGroup>
          <Label>Note</Label>
          <Input type='textarea' value={this.state.noteText} onChange={(event) => this.setState({noteText: event.target.value})} />
        </FormGroup>
        <div>
          <Button color='primary' onClick={() => this.saveNote()}>Save</Button>{' '}
          <Button color='secondary' onClick={() => this.props.done()}>Cancel</Button>{' '}
          { this.props.note.id && (<Button color='danger' onClick={() => this.deleteNote()}>Delete</Button>) }
        </div>
      </div>
    )
  }

  saveNote () {
    const note = Object.assign({}, this.props.note, {
      note: this.state.noteText
    })
    this.props.updateNote(note)
    this.props.done()
  }

  deleteNote () {
    this.props.deleteNote(this.props.note)
  }
}

const stateToProps = (state) => {
  return {
    contacts: state.contacts
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateNote,
    deleteNote
  }, dispatch)
}

NoteEditor.propTypes = {
  note: PropTypes.shape({
    note: PropTypes.string,
    id: PropTypes.number
  }),
  updateNote: PropTypes.func,
  deleteNote: PropTypes.func,
  done: PropTypes.func
}

export default connect(stateToProps, dispatchToProps)(NoteEditor)

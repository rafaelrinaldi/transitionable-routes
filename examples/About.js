import React from 'react'
import { TransitionableComponent } from '../dist/transitionableRoutes.umd.js'

export default class About extends TransitionableComponent {
  constructor (props) {
    super(props)
    this.state = { transition: null }
  }

  willEnter (done) {
    this.setState({ transition: 'enter' }, done)
  }

  willLeave (done) {
    this.setState({ transition: 'leave' }, () => setTimeout(done, 500))
  }

  render () {
    const { transition } = this.state
    const style = {
      opacity: transition === 'enter' ? 1 : 0,
      transition: 'opacity 0.5s ease-out'
    }
    return <h1 style={style}>About</h1>
  }
}

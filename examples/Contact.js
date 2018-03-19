import React from 'react'
import { TransitionableComponent } from '../dist/transitionableRoutes.umd.js'

export default class Contact extends TransitionableComponent {
  constructor (props) {
    super(props)
    this.state = { transition: null }
  }

  willEnter (done) {
    this.setState({ transition: 'enter' }, done)
  }

  willLeave (done) {
    this.setState({ transition: 'leave' }, () => setTimeout(done, 1000))
  }

  render () {
    const { transition } = this.state
    const style = {
      transform: `translateY(${transition === 'enter' ? 0 : '20px'})`,
      opacity: transition === 'enter' ? 1 : 0,
      transition: 'all 1s ease-out'
    }
    return <h1 style={style}>Contact</h1>
  }
}

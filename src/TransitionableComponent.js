import React from 'react'
import RouteTransitions from './RouteTransitions'

export default class TransitionableComponent extends React.PureComponent {
  constructor (props) {
    super(props)

    this.willAppear = this.willAppear.bind(this)
    this.willEnter = this.willEnter.bind(this)
    this.willLeave = this.willLeave.bind(this)
  }

  componentWillMount () {
    this.props.emitter.once(RouteTransitions.WILL_APPEAR, this.willAppear)
    this.props.emitter.once(RouteTransitions.WILL_ENTER, this.willEnter)
    this.props.emitter.once(RouteTransitions.WILL_LEAVE, this.willLeave)
  }

  componentWillUnmount () {
    this.props.emitter.removeAllListeners()
  }

  willAppear (done) {
    done()
  }

  willEnter (done) {
    done()
  }

  willLeave (done) {
    done()
  }
}

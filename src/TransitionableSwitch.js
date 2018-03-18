import React from 'react'
import PropTypes from 'prop-types'
import { matchPath, withRouter } from 'react-router'
import EventEmitter from 'events'
import RouteTransitions from './RouteTransitions'

/**
 * This is a replacement for React Router's `Switch` component.
 * The difference is that this will inject transition hooks to route components.
 * By using event emitters and exposing a simple API, this gives enough control to enable
 * transitions between routes.
 *
 * This work started of as a modification of `react-router-v4-transition`.
 */

class TransitionableSwitch extends React.Component {
  constructor (props) {
    super(props)

    // Local reference to route components
    this._componentEntering = null
    this._componentLeaving = null

    // Hash map with all event emitters by route key
    this._emitters = {}

    this.state = {
      enteringRouteKey: null,
      leavingRouteKey: null,
      match: null
    }
  }

  /**
   * Given a route, returns a component.
   * This accounts for all possible ways React Route offers to render a component.
   */
  _getComponentFromRoute (route) {
    const { props } = route

    if (props.component) return React.createElement(props.component)
    if (props.render) return props.render(props)
    return props.children
  }

  /**
   * Given a route key, returns the event emitter instance for it.
   * If none is found, creates a new one.
   */
  _getEmitterByRouteKey (key) {
    if (!this._emitters.hasOwnProperty(key)) {
      this._emitters[key] = new EventEmitter()
    }
    return this._emitters[key]
  }

  /**
   * Creates a transitionable component.
   * All it does is to clone a React Component and inject key and emitter props to it.
   */
  _createTransitionableComponent (Component, options) {
    const { key, path, ...props } = options
    const emitter = this._getEmitterByRouteKey(key)

    return React.cloneElement(Component, {
      emitter,
      key,
      path,
      ...props
    })
  }

  /**
   * Helper to submit an event to a transitionable component.
   * This also figures out what the target should be by analyzing the event being sent.
   */
  _emit (event, payload) {
    // There's only two possible options: entering or leaving
    const mapEventToTarget = event =>
      /appear|enter$/i.test(event)
        ? this._componentEntering
        : this._componentLeaving
    const target = mapEventToTarget(event)

    if (!target) return

    const { emitter, path } = target.props

    // Wait for browser's next tick to emit the event so we can animate properly
    return window.requestAnimationFrame(() => {
      log(`Emitting new event "${event}" to "${path}"`)
      emitter.emit(event, payload)
    })
  }

  _updateChildren (props) {
    let hasFoundMatch = false

    const routes = React.Children.map(props.children, route => route)

    routes.forEach(route => {
      const pathData = {
        path: route.props.path,
        exact: route.props.exact,
        strict: route.props.strict
      }

      const { location } = props

      const match = matchPath(location.pathname, pathData)

      if (!hasFoundMatch && match) {
        hasFoundMatch = true

        // If route is already rendered, do nothing
        if (this.state.enteringRouteKey === route.key) return

        // Update `_componentLeaving` as the new `_componentEntering`
        if (!this.state.leavingRouteKey) {
          this._componentLeaving = this._componentEntering
          this._componentEntering = null
        }

        const leavingRouteKey = this.state.leavingRouteKey
          ? this.state.leavingRouteKey
          : this.state.enteringRouteKey

        this.setState({
          leavingRouteKey,
          enteringRouteKey: route.key,
          match
        })
      }
    })

    // In case we didn't find a match, the `_componentEntering` will leave:
    if (!hasFoundMatch && this.state.enteringRouteKey) {
      this._componentLeaving = this._componentEntering
      this._componentEntering = null

      this.setState({
        leavingRouteKey: this.state.enteringRouteKey,
        enteringRouteKey: null,
        match: null
      })
    }
  }

  _componentDidAppear () {
    this._emit(RouteTransitions.APPEAR)
  }

  _componentDidEnter () {
    this._emit(RouteTransitions.ENTER)
  }

  // TODO: Add ability to not unmount on leave
  _componentDidLeave () {
    this._emit(RouteTransitions.LEAVE)

    this._componentLeaving = null
    this.setState({ leavingRouteKey: null })
  }

  componentWillMount () {
    // We must initialize the current route before mounting it
    this._updateChildren(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this._updateChildren(nextProps)
  }

  componentDidMount () {
    if (this._componentEntering) {
      this._emit(RouteTransitions.WILL_APPEAR, () => this._componentDidAppear())
    } else {
      this._componentDidAppear()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const isEnteringNewRoute =
      prevState.enteringRouteKey === this.state.enteringRouteKey
    const hasLeftPreviousRoute =
      prevState.leavingRouteKey && !this.state.leavingRouteKe
    const shouldEmitWillEnter = isEnteringNewRoute && hasLeftPreviousRoute
    const shouldEmitWillLeave =
      this._componentLeaving && !prevState.leavingRouteKey
    const isSameLocation =
      prevProps.location.pathname === this.props.location.pathname
    const isSameMatch = prevProps.match.isExact === this.props.match.isExact

    if (shouldEmitWillEnter) {
      this._emit(RouteTransitions.WILL_ENTER, () => this._componentDidEnter())
    }

    // If the location didn't change we do nothing and let the eventual active transitions run
    if (isSameLocation && isSameMatch) return

    // If there's no component leaving, it means it already left
    if (!this._componentLeaving) this._componentDidLeave()

    if (shouldEmitWillLeave) {
      this._emit(RouteTransitions.WILL_LEAVE, () => this._componentDidLeave())
    }
  }

  render () {
    const nextProps = {
      match: this.state.match,
      location: this.props.location,
      history: this.context.history,
      staticContext: this.context.staticContext
    }

    // Map all routes and filter it by the ones we care about
    const routes = React.Children.map(
      this.props.children,
      route => route
    ).filter(route =>
      [this.state.enteringRouteKey, this.state.leavingRouteKey].includes(
        route.key
      )
    )

    routes.forEach(route => {
      const Component = this._getComponentFromRoute(route)
      const transitionableComponent = this._createTransitionableComponent(
        Component,
        {
          key: route.key,
          path: route.props.path,
          nextProps
        }
      )

      if (route.key === this.state.enteringRouteKey) {
        this._componentEntering = transitionableComponent
      } else if (route.key === this.state.leavingRouteKey) {
        this._componentLeaving = transitionableComponent
      }
    })

    // Only renders `_componentEntering` when `_componentLeaving` left
    if (this.state.leavingRouteKey) this._componentEntering = null

    return (
      <React.Fragment>
        {this._componentEntering}
        {this._componentLeaving}
      </React.Fragment>
    )
  }
}

export default withRouter(TransitionableSwitch)

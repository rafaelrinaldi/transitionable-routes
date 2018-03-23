[animate]: http://animate.mhaagens.me
[events]: https://github.com/Gozala/events
[potato]: https://github.com/codify-to/Potato
[react-router-v4-transition]: https://github.com/aboeglin/react-router-v4-transition
[react-router]: https://reacttraining.com/react-router
[react-transition-group]: https://github.com/reactjs/react-transition-group
[react]: https://reactjs.org
[redux]: https://redux.js.org
[robotlegs]: http://www.robotlegs.org
[url]: https://rinaldi.io

# transitionable-routes ![Experimental](https://img.shields.io/badge/stability-experimental-orange.svg)

> Perform transitions when changing routes with React Router

# Install

```sh
npm i transitionable-routes
```

## The Problem

The ability to add animations whenever a route changes seems like such a trivial feature but weirdly enough I haven't found a nice way of doing it with [React][react] and [React Router][react-router].

All the examples I've seen out there – including the ones in the official docs – usually assume you are performing generic transitions such as fading in and out the routes entering and leaving. If you need more control over that, good luck.

At some point in time this was achievable via [react-transition-group][react-transition-group] but at some point React Router had a major bump that broke integration with it and as a workaround the react-transition-group team changed the API in a way that for me was a downgrade since they've made much harder to make things customizable (they've added a `in` property that makes no sense to me and instead of controlling animations via callbacks you had to pass down how long transitions would take, which is an idea that I dislike very much).

Coming from a Flash background I remember this used to be a feature we took for granted. Either you rolled your own at the beginning of the project or you would have it available via frameworks (shout out to [Potato <small>(aka Patota)</small>][potato] and [Robotlegs][robotlegs]).

## The Solution

>Keep in mind that this was put together in a few hours and is still experimental. If you have ideas on how to improve it, do chime in.

Out of desperation (I couldn't imagine this would take longer than a few minutes to ship) I decided to hack my way into a solution. I have started by writing the API that I wanted then started putting something together off of some good ideas that I've seen in the wild.

### `TransitionableSwitch`

This is a simple stateful React component that acts as a replacement for React Router's `Switch`. It knows how to render route components based on the active route, but it also knows how to coordinate rendering of routes that are transitioning (either entering or leaving).

This component injects hooks to every route component that is transitioning so inside of it you have access to transition states.

The coordination of transition states is done via [event emitters][events]. These are responsible for communicating state from the switcher down to the component.
I have tried using React `ref` for this but had a bad experience, specially when you're trying to wrap a [Redux][redux]-connected component, so I went for good ol' event emitters (which still sounds kinda crazy but did the job well).

### `TransitionableComponent`

This is a simple React component that automatically handles syncing the component to the event emitter and exposes all the hooks available for transitions:

* `willAppear`
* `willEnter`
* `willLeave`

All hooks receive a callback function as an argument so you can do whatever you want and call them once you're done.

## Usage

```jsx
import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { TransitionableSwitch, TransitionableComponent } from 'transitionable-routes'

const Home = () => <h1>Home</h1>

class About extends TransitionableComponent {
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

class Contact extends TransitionableComponent {
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

const App = () => (
  <BrowserRouter>
    <TransitionableSwitch>
      <Route exact path='/' render={() => <Home />} />
      <Route path='/about' component={About} />
      <Route path='/contact' children={<Contact />} />
    </TransitionableSwitch>
  </BrowserRouter>
)

render(<App />, document.querySelector('[data-app]'))
```

Checkout the [examples folder](./examples).

```sh
npm start
```

## Project Pipeline

![Help Wanted](http://messages.hellobits.com/warning.svg?message=Help%20Wanted)

### Conditional rendering

As of now `TransitionableSwitch` is not really able to deal with conditional route rendering. Think of routes that required the user logged in to be rendered:

```js
const App = () => (
  <Route exect path="/" component={Home} />
  <Route path="/login" component={Login} />
  <Route path="/secret" render={() => {
    isUserLoggedIn ? <SuperSecretComponent /> : <Redirect to="/login" />
  }}>
)
```

`TransitionableSwitch` still doesn't know how to deal with `Redirect` so even though the route will properly change in this example the login component won't be mounted.

### API

Even though we have `TransitionableComponent` it still feels like we could improve the API since there's quite a lot of boilerplate involved as it is right now. To create a route component that is able to perform transitions:

1. Create a new React component that extends `TransitionableComponent`
2. Override transition lifecycle methods and fire `done()`
3. If your component needs to do anything on either `componentWillMount()` or `componentWillUnmount()` you have to remember to invoke `super()` otherwise things will break
4. Whenever implementing a transition you must make your component stateful and manually change transition steps so you can do your thing on `render()`, this can become annoying if you have a lot of custom transitions

As mentioned on #1 this could perhaps be improved with HOCs instead of using a class like `TransitionableComponent` but I'm not sure yet on what's the best thing to do there.

### Examples

Current examples are super simple and limited. It would be nice to have better ones that properly showcase this project's capabilities.

## Related

* [animate][animate]
* [react-router-v4-transition][react-router-v4-transition]

## License

MIT © [Rafael Rinaldi][url]

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

## API

## Related

* [animate][animate]
* [react-router-v4-transition][react-router-v4-transition]

## License

MIT © [Rafael Rinaldi][url]

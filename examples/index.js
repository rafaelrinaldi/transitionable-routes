import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import TransitionableSwitch from '../src/TransitionableSwitch'
import Home from './Home'
import About from './About'
import Contact from './Contact'

const App = () => (
  <BrowserRouter>
      <TransitionableSwitch>
        <Route exact path='/' render={() => <Home />} />
        <Route path='/about' component={About} />
        <Route path='/contact' children={<Contact />} />
      </TransitionableSwitch>
    </div>
  </BrowserRouter>
)

render(<App />, document.querySelector('[data-app]'))

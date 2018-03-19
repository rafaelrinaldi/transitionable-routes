import React from 'react'
import { render } from 'react-dom'
import { withRouter } from 'react-router'
import { Router, BrowserRouter, Route, Link } from 'react-router-dom'
import TransitionableSwitch from '../src/TransitionableSwitch'
import Menu from './Menu'
import Home from './Home'
import About from './About'
import Contact from './Contact'

const App = () => (
  <BrowserRouter>
    <div style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Link to='/contact'>Contact</Link>
        </li>
      </ul>

      <hr />

      <TransitionableSwitch>
        <Route exact path='/' render={() => <Home />} />
        <Route path='/about' component={About} />
        <Route path='/contact' children={<Contact />} />
      </TransitionableSwitch>
    </div>
  </BrowserRouter>
)

// const App = () => (
//   <React.Fragment>
//     <BrowserRouter>
//       <Menu />
//       <TransitionableSwitch>
//         <Route exact path='/' component={Home} />
//         <Route path='/about' component={About} />
//         <Route path='/contact' component={Contact} />
//       </TransitionableSwitch>
//     </BrowserRouter>
//   </React.Fragment>
// )

render(<App />, document.querySelector('[data-app]'))

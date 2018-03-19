import React from 'react'
import { withRouter } from 'react-router'

class Menu extends React.PureComponent {
  render () {
    return (
      <nav style={{ fontFamily: 'SF UI Text' }}>
        <ul>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
          <Link to='/contact'>Contact</Link>
        </ul>
      </nav>
    )
  }
}

export default withRouter(Menu)

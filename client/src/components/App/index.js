import React, { Component } from 'react';
import LoginButton from '../LoginButton';
import './index.css';

class App extends Component {
  render() {
    return (
      <div className="app-container">
        <LoginButton />
      </div>
    );
  }
}

export default App;

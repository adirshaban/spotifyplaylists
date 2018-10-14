import React, { Component } from 'react';
import LoginButton from '../LoginButton';
import './index.css';

class App extends Component {
  constructor() {
    super()

    const params = this.getHashParams();
    this.state = {
      accessToken: params.access_token
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  render() {
    return (
      <div className="app-container">
        <div className="logo">
          <img src="public/logo.jpeg" alt="Logo" />
        </div>
        <LoginButton />
      </div>
    );
  }
}

export default App;
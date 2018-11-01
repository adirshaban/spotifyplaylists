import React, { Component } from 'react';
import LoginButton from '../LoginButton';
import './index.css';
import Search from '../Search';
import ArtistList from '../ArtistList';

class App extends Component {
  constructor() {
    super()

    const params = this.getHashParams();
    this.state = {
      accessToken: params.access_token,
      artists: [],
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

  addArtist = (artist) => {
    this.setState({artists: [artist, ...this.state.artists]})
  }

  changeType = (artist, type) => {
    this.setState({artists: [Object.assign(artist, type), ...this.state.artists.filter(cArtist => cArtist.id !== artist.id)]})
  }

  render() {
    return (
      <div className="app-container">
        <div className="logo">
          <img src="public/logo.jpeg" alt="Logo" />
        </div>
        {this.state.accessToken ? <Search token={this.state.accessToken} addArtist={this.addArtist} /> : <LoginButton />}
        {this.state.artists && <ArtistList artists={this.state.artists} changeType={this.changeType} />}
      </div>
    );
  }
}

export default App;
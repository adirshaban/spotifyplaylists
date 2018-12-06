import React, { useState } from 'react';
import LoginButton from '../LoginButton';
import './index.css';
import Search from '../Search';
import ArtistList from '../ArtistList';
import EditableTitle from '../EditableTitle';
import request from 'superagent';

function getHashParams() {
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

function App() {
  const params = getHashParams();
  const [ accessToken, ] = useState(params.access_token);
  const [ artists, setArtists] = useState([]);
  const [ title, setTitle ] = useState('OMG! OMG!');

  function addArtist(artist) {
    setArtists([artist, ...artists]);
  }

  function changeType(artist, allAlbums) {
    setArtists([Object.assign(artist, {allAlbums}), ...artists.filter(cArtist => cArtist.id !== artist.id)]);
  }

  async function postPlaylist() {
    const response = await request
      .post('http://localhost:8080/playlist')
      .send({
        name: title,
        isPublic: true,
        artists: artists.map(artist => ({id: artist.id, tophits: !artist.allAlbums}))
      })
      .set('spotify-access-token', this.props.token)
      .set('Accept', 'application/json')
;
// TODO: Somehting with the response
  }

  function renderApp() {
    return (
      <React.Fragment>
        <EditableTitle
            onChange={title => {setTitle(title)}}
            />
        <Search token={accessToken} addArtist={addArtist} />
        <ArtistList artists={artists} changeType={changeType} />
        <button className="button is-primary" onClick={postPlaylist}>Done</button>
      </React.Fragment>
    )
  }

  
  return (
    <div className="app-container">
      <div className="logo">
        <span className="icon is-right">
                  <i className="fa fa-spotify fa-2x"></i>
        </span>
        <strong style={{fontSize: 'xx-large', color: 'white'}}>Spotify Playlists</strong>          
      </div>
      {accessToken ?  renderApp() : <LoginButton />}
    </div>
  );

}

export default App;
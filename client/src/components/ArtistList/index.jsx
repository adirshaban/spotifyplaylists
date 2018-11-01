import React from 'react';
import './index.css'

function Artist({artist, changeType}) {
    return  (
    <article className="media artist-card">
        <figure className="media-left">
            <p className="image is-64x64">
                <img src={artist.images[1].url} alt={artist.name} />
            </p>
        </figure>
        <div className="media-content">
            <div className="content">
                {artist.name}
            </div>
        </div>
        <div className="media-right">
            <div className="control">
                <label className="radio">
                    <input type="radio" name="type" onChange={changeType.bind(null,artist, 'all')} checked /> All Albums
                </label>
                <label className="radio"> 
                    <input type="radio" name="type" onChange={changeType.bind(null,artist, 'top')} /> Top tracks
                </label>
            </div>
        </div>
    </article>
    )
};

export default ({artists, changeType}) => {
    return <div>
        {artists.map(artist => <Artist key={artist.id} artist={artist} changeType={changeType} />)}
    </div>
}
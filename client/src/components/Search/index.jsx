import React,  { useState } from 'react';
import Autocomplete from 'react-autocomplete';
import request from 'superagent';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

function Search(props) {
    const [term, setTerm ] = useState('');
    const [items, setItems] = useState([]);

    const searchArtist = (serachTerm) => request
                            .get('http://localhost:8080/search')
                            .query({term: serachTerm})
                            .set('spotify-access-token', props.token);
    
    const debouncedSearch = AwesomeDebouncePromise(searchArtist, 500);

    const onChange = async (e) => {
        setTerm(e.target.value); 
        // {body: {artists: {items}}}
        const {body: {results: {artists: {items}}}} = await debouncedSearch(e.target.value);
        
        // console.log(res.body)
        setItems(items);
    }

    const onSelect = (value) => {
        props.addArtist(items.filter(item => item.name === value)[0]);
        setTerm('');
    }

    
    const menuStyle={
        borderRadius: '5px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 0',
        fontSize: '90%',
        position: 'fixed',
        overflow: 'hidden',
        maxHeight: '50%',
        },
        wrapperStyle={
        display: 'block',
        margin: '1vh auto',
        width: '20%',
        textAlign: 'center',
        };
    return (
    <Autocomplete
        getItemValue={(item) => item.name}
        items={items}
        renderItem={(item, isHighlighted) =>
            <div style={{ background: isHighlighted ? 'lightgray' : 'white' , color: 'black'}}>
            {item.name}
            </div>
        }
        renderInput={(props) => <input className="input" {...props}/>}
        value={term}
        onChange={onChange}
        onSelect={onSelect}
        wrapperStyle={wrapperStyle}
        menuStyle={menuStyle}
    />)

}

export default Search;
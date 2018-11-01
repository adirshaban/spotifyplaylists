import React,  { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import request from 'superagent';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

class Search extends Component {
    state ={
        value: '',
        items: []
    }

    searchArtist = (term) => request
                            .get('http://localhost:8080/search')
                            .query({term})
                            .set('spotify-access-token', this.props.token);
    
    debouncedSearch = AwesomeDebouncePromise(this.searchArtist, 500);

    onChange = async (e) => {
        this.setState({value: e.target.value}) 
        // {body: {artists: {items}}}
        const {body: {results: {artists: {items}}}} = await this.debouncedSearch(e.target.value);
        
        // console.log(res.body)
        this.setState({items});
    }

    onSelect = (value) => {
        this.props.addArtist(this.state.items.filter(item => item.name === value)[0]);
        this.setState({value: ''});
    }

    render() {
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
            items={this.state.items}
            renderItem={(item, isHighlighted) =>
                <div style={{ background: isHighlighted ? 'lightgray' : 'white' , color: 'black'}}>
                {item.name}
                </div>
            }
            renderInput={(props) => <input className="input" {...props}/>}
            value={this.state.value}
            onChange={this.onChange}
            onSelect={this.onSelect}
            wrapperStyle={wrapperStyle}
            menuStyle={menuStyle}
        />)
    }
}

export default Search;
import React, { useState, useRef } from "react";
import Autocomplete from "react-autocomplete";
import request from "superagent";
import { debounce } from "throttle-debounce";
import styled from "styled-components";

const Form = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: grey;
  width: ${props => (props.barOpened ? "30rem" : "2rem")};
  padding: 1.5em;
  height: 1.5rem;
  border-radius: 10rem;
  transition: width 300ms cubic-bezier(0.645, 0.045, 0.355, 1);
`;

const SearchInput = styled.input`
  font-size: 1em;
  line-height: 1;
  background-color: transparent;
  margin-left: ${props => (props.barOpened ? "1rem" : "0rem")};
  width: 100%;
  border: none;
  color: white;
  transition: margin 300ms cubic-bezier(0.645, 0.045, 0.355, 1);

  &:focus,
  &:active {
    outline: none;
  }
  &::placeholder {
    color: white;
  }
`;

const SearchButton = styled.button`
  line-height: 1;
  pointer-events: ${props => (props.barOpened ? "auto" : "none")};
  cursor: ${props => (props.barOpened ? "pointer" : "none")};
  background-color: transparent;
  border: none;
  outline: none;
  color: white;
`;

function Search(props) {
  const [term, setTerm] = useState("");
  const [barOpened, setBarOpened] = useState(false);
  const [items, setItems] = useState([]);
  const inputRef = useRef();

  const searchArtist = serachTerm =>
    request
      .get("http://localhost:8080/search")
      .query({ term: serachTerm })
      .set("spotify-access-token", props.token);

  const debouncedSearch = debounce(500, false, searchArtist);

  const onChange = async e => {
    setTerm(e.target.value);

    const {
      body: {
        results: {
          artists: { items }
        }
      }
    } = await searchArtist(e.target.value);

    setItems(items);
  };

  const onSelect = value => {
    props.addArtist(items.filter(item => item.name === value)[0]);
    setTerm("");
    setItems([]);
  };

  const menuStyle = {
      borderRadius: "5px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      background: "rgba(255, 255, 255, 0.9)",
      padding: "2px 0",
      fontSize: "90%",
      position: "fixed",
      overflow: "auto",
      maxHeight: "50%",
    },
    wrapperStyle = {
      display: "block",
      margin: "1vh auto",
      width: "100%",
      textAlign: "center"
    };

  const handleFormClick = () => {
    setBarOpened(true);
    inputRef.current.focus();
    
  };

  const handleFormFocus = () => {
    setBarOpened(true);
    inputRef.current.focus();
  };

  const handleFormBlur = () => {
    setBarOpened(false);
    setItems([]);
    setTerm("");
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setTerm("");
    setItems([]);
    setBarOpened(false);    
  };

  return (
    <Form
      barOpened={barOpened}
      onClick={handleFormClick}
      onFocus={handleFormFocus}
      onBlur={handleFormBlur}
      onSubmit={handleFormSubmit}
    >
      <SearchButton type="submit" barOpened={barOpened}>
        <span
          className="icon is-right"
          style={{ color: "white", margin: "1vh 0.5vw" }}
        >
          <i className="fa fa-search fa-2x"></i>
        </span>
      </SearchButton>
      <Autocomplete
        getItemValue={item => item.name}
        items={items}
        renderItem={(item, isHighlighted) => (
          <div
            style={{
              background: isHighlighted ? "lightgray" : "white",
              color: "black"
            }}
          >
            {item.name}
          </div>
        )}
        renderInput={props => (
          <SearchInput
            barOpened={props.barOpened}
            placeholder="Serach artist"
            focus
            {...props}
          />
        )}
        value={term}
        onChange={onChange}
        onSelect={onSelect}
        wrapperStyle={wrapperStyle}
        menuStyle={menuStyle}
        ref={inputRef}
      />
    </Form>
  );
}

export default Search;

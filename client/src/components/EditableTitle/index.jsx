import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const Title = styled.span`
  font-size: 1.5em;
  text-align: center;
  padding: 0.5rem;
  font-family: "Titillium Web", sans-serif;
  color: black;

  &:hover {
    border-bottom: 0.2rem dotted black;
    /* border: 1px solid #3a3939;
    border-radius: 0.75rem; */
  }
`;

const TitleInput = styled.input`
  font-size: 1.5em;
  line-height: 1;
  background-color: transparent;
  padding: 0.5rem;
  color: black;
  border-top: none;
  border-right: none;
  border-left: none;
  border-bottom: 0.2rem dotted black;

  font-family: "Titillium Web", sans-serif;

  &:focus,
  &:active {
    outline: none;
  }
`;

const TitleContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30%;
`;

function EditableTitle() {
  const [title, setTitle] = useState("My Awesome Title");
  const [isLabel, setIsLabel] = useState(true);
  const inputRef = useRef(null);

  const handleLabelClick = () => {
    setIsLabel(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleKeyUp = (e) => {
    if (e.keyCode === 13) {
      setIsLabel(true);
    }
  };

  const handleTitleBlur = () => {
    setIsLabel(true);
  };

  useEffect(() => {
    if (!isLabel) {
      inputRef.current.focus();
      
    }
  }, [isLabel]);

  return (
    <TitleContainer>
      
      {isLabel ? (
        <Title onClick={handleLabelClick}>{title}</Title>
      ) : (
        <TitleInput
          value={title}
          onChange={handleTitleChange}
          onKeyUp={handleTitleKeyUp}
          onBlur={handleTitleBlur}
          ref={inputRef}
          focus
        />
      )}
    </TitleContainer>
  );
}

export default EditableTitle;

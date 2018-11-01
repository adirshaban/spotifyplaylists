import React, { useState } from 'react';
import './index.css'

function Label({children, onClick}) {
    return (
        <div className="field">
            <p className="label-container" onClick={onClick}>
                <label className="label-title" >{children}</label>
                <span className="icon is-right" style={{margin: 'auto 0'}}>
                    <i className="fa fa-edit fa-2x"></i>
                </span>
            </p>
        </div>
    )
}

function Input({value, onSave}) {
    const [cValue, setValue ] = useState(value);

    const onKeyUp = (e) => {
        if (e.keyCode === 13) {
            onSave(cValue);
        }
    }

    const save = () => {
        onSave(cValue);
    }

    const onChange = e => {
        setValue(e.target.value);
    }

    const containerStyle = {
        width: '35%',
        margin: '0 auto'
    };

    const inputStyle = {
        fontSize: 'larger',
        backgroundColor: 'rgba(255,255,255,0.8)'
    }

    return (
        <div className="field">
         <p style={containerStyle} className="control">
            <input className="input" style={inputStyle} autoFocus type="text" value={cValue} onBlur={save} onChange={onChange} onKeyUp={onKeyUp} />            
        </p>
    </div>
    )
}

function EditableTitle({onChange}) {
    const [title, updateTitle] = useState('My Awesome Title');
    const [isLabel, setIsLabel] = useState(true);
    return (
        <React.Fragment>
        {
            isLabel ? 
                <Label onClick={setIsLabel.bind(null, false)}>{title}</Label> : 
                <Input value={title} onSave={title => {setIsLabel(true); updateTitle(title); onChange(title)}} />
        }
        </React.Fragment>
    )
}

export default EditableTitle;
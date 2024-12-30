import React from 'react';
import Select from 'react-select';
import { components } from 'react-select';
import OutlinedIcon from '../icons/outlined-icon';
import "@material/web/elevation/elevation"

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'var(--md-sys-color-surface)',
    borderColor: 'var(--md-sys-color-outline)',
    borderRadius: '4px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'var(--md-sys-color-outline)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--md-sys-color-surface-container)',
    borderRadius: '4px',
    boxShadow: 'var(--md-sys-elevation-level2)',
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--md-sys-color-primary-container)'
      : state.isFocused
      ? 'var(--md-sys-color-surface-variant)'
      : 'var(--md-sys-color-surface-container)',
    color: state.isSelected
      ? 'var(--md-sys-color-on-primary-container)'
      : 'var(--md-sys-color-on-surface)',
    '&:hover': {
      backgroundColor: 'var(--md-sys-color-surface-variant)',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--md-sys-color-on-surface)',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--md-sys-color-on-surface-variant)',
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--md-sys-color-on-surface)',
  }),
};

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <OutlinedIcon icon='arrow_drop_down'/>
    </components.DropdownIndicator>
  );
};

const Menu = (props) => {
  return (
    <components.Menu {...props}>
      <div 
      className="md-elevation relative" 
      style={{ 
        borderRadius: '4px',
        '--md-elevation-level': 3
      }}>
        <md-elevation level="2" />
        {props.children}
      </div>
    </components.Menu>
  );
};

const Dropdown = ({ options, defaultValue, value, onChange }) => {
  const handleChange = (selectedOption) => {
    if (onChange) onChange(selectedOption);
  };

  return (
    <Select
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      classNamePrefix="react-select"
      styles={customStyles}
      components={{ DropdownIndicator, Menu }}
    />
  );
};

export default Dropdown;

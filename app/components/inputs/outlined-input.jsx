import React from 'react';
import '@material/web/textfield/outlined-text-field.js';
import PropTypes from 'prop-types';
import { type } from 'os';

const Input = ({ label, value, leadingIcon, trailingIcon, ...props }) => {
  const handleKeyDown = (e) => {
    if (trailingIcon && trailingIcon.type === 'button' && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="input-wrapper w-full flex items-center">
      <md-outlined-text-field
        label={label}
        value={value}
        type={type}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {leadingIcon && <div slot="leading-icon">{leadingIcon}</div>}
        {trailingIcon && <div slot="trailing-icon">{trailingIcon}</div>}
      </md-outlined-text-field>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  type: PropTypes.string,
  leadingIcon: PropTypes.node,
  trailingIcon: PropTypes.node,
};

export default Input;
import React from 'react';
import '@material/web/textfield/outlined-text-field.js';
import PropTypes from 'prop-types';
import { type } from 'os';

const Input = ({ label, value, leadingIcon, trailingIcon, ...props }) => {
  return (
    <div className="input-wrapper w-full flex items-center">
      <md-outlined-text-field
        label={label}
        value={value}
        type={type}
        {...props}
      >
        {leadingIcon && <span slot="leading-icon">{leadingIcon}</span>}
        {trailingIcon && <span slot="trailing-icon">{trailingIcon}</span>}
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
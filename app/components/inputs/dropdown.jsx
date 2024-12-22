import React, { useState } from 'react';
import OutlinedIcon from '../icons/outlined-icon';

const Dropdown = ({ options, defaultValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || options[0]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="relative border border-[--md-sys-color-outline] rounded-md focus-within:border-[--md-sys-color-primary]">
      <button
        className="w-full px-4 py-2 text-left bg-[--md-sys-color-surface] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[--md-sys-color-primary] text-[--md-sys-color-on-surface] transition-all duration-100 ease-in-out" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <md-ripple />
        {selectedOption?.label || selectedOption}
        <OutlinedIcon icon={isOpen ? "expand_less" : "expand_more"} className='absolute inset-y-0 right-0 flex items-center pr-2'/>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[--md-sys-color-surface] rounded-md shadow-lg">
          <ul className="py-1">
            {options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-[--md-sys-color-surface-container-highest] relative"
                onClick={() => handleSelect(option)}
              >
                <md-ripple />
                {option?.label || option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;

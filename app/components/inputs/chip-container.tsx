import ChipInput from './chip-input';
import { ChangeEvent } from 'react';

interface ChipInputProps {
  icon?: string;
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

interface ChipContainerProps {
  chips: ChipInputProps[];
}
export default function ChipContainer(props: ChipContainerProps) {
  return (
    <div className="flex no-wrap gap-2 overflow-x-auto">
      {props.chips.map((chip) => (
        <ChipInput key={chip.value} {...chip} />
      ))} 
    </div>
  )
}
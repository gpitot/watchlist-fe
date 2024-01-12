import {
  MultiSelect as MultiSelectComponent,
  Option,
} from "react-multi-select-component";

export const MultiSelect: React.FC<{
  options: Option[];
  selected: Option[];
  setSelected: (selected: Option[]) => void;
  label: string;
}> = ({ options, selected, setSelected, label }) => {
  return (
    <MultiSelectComponent
      options={options}
      value={selected}
      onChange={setSelected}
      labelledBy={label}
      className="w-64 p-4"
    />
  );
};

import { Field } from "react-final-form";

type CheckboxProps = {
  label: string;
  name: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({ label, name }) => {
  return (
    <Field name={name}>
      {({ input }) => (
        <label>
          <input type="checkbox" {...input} />
          {label}
        </label>
      )}
    </Field>
  );
};

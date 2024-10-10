import { Field } from "react-final-form";

type InputProps = {
  label: string;
  name: string;
  type?: string;
};
export const Input: React.FC<InputProps> = ({ label, name, type = "text" }) => {
  return (
    <Field name={name}>
      {({ input, meta }) => (
        <div className="flex flex-col">
          <label>{label}</label>
          <input type={type} {...input} className="border-2 p-2" />
          {meta.touched && meta.error && (
            <span className="text-red-500 text-sm italic">{meta.error}</span>
          )}
        </div>
      )}
    </Field>
  );
};

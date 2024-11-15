import { MultiSelect } from "components/multi_select";
import { Checkbox } from "components/checkbox";
import { Form } from "react-final-form";

type FilterForm = {
  watched: boolean;
};

export const Filter: React.FC = () => {
  const onSubmit = async (values: FilterForm) => {};
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ newPassword: "", confirmPassword: "" }}
      render={({ handleSubmit }) => (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-2 p-4 max-w-[400px]"
        >
          <h1>Filter</h1>
          <Checkbox name="watched" label="Watched" />

          <MultiSelect
            selected={userProviderOptions}
            options={allProviderOptions}
            setSelected={handleSelectProviders}
            label={"Select Providers"}
          />
        </form>
      )}
    />
  );
};

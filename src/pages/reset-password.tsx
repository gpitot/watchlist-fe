import React from "react";
import { Form } from "react-final-form";
import { useUpdateUserPassword } from "api/user";
import { Input } from "components/Input";
import { useNavigate } from "react-router-dom";
import { FORM_ERROR } from "final-form";
import { clearFormErrors } from "components/formMutators";

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export const ResetPasswordPage: React.FC = () => {
  const { mutateAsync, isLoading } = useUpdateUserPassword();

  const navigate = useNavigate();

  const onSubmit = async (values: PasswordForm) => {
    const { error } = await mutateAsync(values.newPassword);
    if (error) {
      return {
        [FORM_ERROR]: error.message,
      };
    }
    navigate("/");
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={(values) => {
        if (values.newPassword !== values.confirmPassword) {
          return { confirmPassword: "Passwords do not match" };
        }
        if (values.newPassword.length < 8) {
          return { newPassword: "Password must be at least 8 characters" };
        }
      }}
      initialValues={{ newPassword: "", confirmPassword: "" }}
      mutators={{ clearFormErrors }}
      render={({
        handleSubmit,
        submitError,
        valid,
        modifiedSinceLastSubmit,
        active,
        submitFailed,
        form,
      }) => {
        if (active && submitFailed) {
          form.mutators.clearFormErrors();
        }
        return (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-y-2 p-4 max-w-[400px]"
          >
            <h1 className="text-xl bold">Reset your password</h1>

            <Input label="New password" name="newPassword" type="password" />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
            />

            {submitError && !modifiedSinceLastSubmit && (
              <span className="text-red-500 text-sm italic">{submitError}</span>
            )}

            <button
              type="submit"
              disabled={isLoading || !valid}
              className="border-2 bg-slate-500 text-white p-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        );
      }}
    />
  );
};

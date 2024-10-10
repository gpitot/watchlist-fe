/* eslint-disable no-param-reassign */
import { MutableState } from 'final-form';

export const clearFormErrors = <T>(args: object, form: MutableState<T>) => {
  form.formState.submitError = undefined;
  form.formState.errors = {};
  form.formState.submitErrors = {};
  form.formState.submitFailed = false;
};
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "./Input";
import { Select } from "./Select";
import { TextArea } from "./TextArea";
import type {
  ReactNode,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldType = "input" | "select" | "textarea" | "custom";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  children?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
  textAreaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  control: Control<T>;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = "input",
  options = [],
  children,
  inputProps,
  selectProps,
  textAreaProps,
  control,
}: FormFieldProps<T>) {
  const { field, fieldState } = useController({ name, control });
  const errorMessage = fieldState.error?.message;

  if (type === "custom") {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        {children}
        {errorMessage && (
          <p className="text-sm text-brand-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (type === "select") {
    return (
      <Select
        label={label}
        options={options}
        error={errorMessage}
        {...field}
        value={
          (field.value as string | number | readonly string[] | undefined) ?? ""
        }
        {...selectProps}
      />
    );
  }

  if (type === "textarea") {
    return (
      <TextArea
        label={label}
        error={errorMessage}
        {...field}
        value={
          (field.value as string | number | readonly string[] | undefined) ?? ""
        }
        {...textAreaProps}
      />
    );
  }

  const isCheckbox = inputProps?.type === "checkbox";
  return (
    <Input
      label={label}
      error={errorMessage}
      {...field}
      {...(isCheckbox
        ? { checked: !!field.value, value: inputProps?.value ?? name }
        : {
            value:
              (field.value as
                string | number | readonly string[] | undefined) ?? "",
          })}
      {...inputProps}
    />
  );
}

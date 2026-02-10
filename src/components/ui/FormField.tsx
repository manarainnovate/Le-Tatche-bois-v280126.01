"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type ControllerRenderProps,
} from "react-hook-form";

// ═══════════════════════════════════════════════════════════
// FORM FIELD PROPS
// ═══════════════════════════════════════════════════════════

export interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}

// ═══════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════

function FormField<T extends FieldValues>({
  control,
  name,
  label,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5 w-full">
          {/* Label */}
          {label && (
            <label className="text-sm font-medium text-wood-dark">
              {label}
            </label>
          )}

          {/* Render the input component */}
          {render(field)}

          {/* Error message from react-hook-form */}
          {fieldState.error?.message && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// FORM FIELD CONTEXT (for nested form components)
// ═══════════════════════════════════════════════════════════

interface FormFieldContextValue {
  error?: string;
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

export function useFormField() {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }
  return context;
}

// ═══════════════════════════════════════════════════════════
// FORM ITEM (simple wrapper for consistent spacing)
// ═══════════════════════════════════════════════════════════

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

function FormItem({ children, className }: FormItemProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className || ""}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FORM LABEL
// ═══════════════════════════════════════════════════════════

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

function FormLabel({ children, required, htmlFor }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-wood-dark">
      {children}
      {required && <span className="text-red-500 ms-1">*</span>}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════
// FORM MESSAGE (for error display)
// ═══════════════════════════════════════════════════════════

interface FormMessageProps {
  children?: React.ReactNode;
  error?: string;
}

function FormMessage({ children, error }: FormMessageProps) {
  const message = error || children;
  if (!message) return null;

  return <p className="text-sm text-red-500">{message}</p>;
}

// ═══════════════════════════════════════════════════════════
// FORM HINT
// ═══════════════════════════════════════════════════════════

interface FormHintProps {
  children: React.ReactNode;
}

function FormHint({ children }: FormHintProps) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export {
  FormField,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
  FormHint,
};

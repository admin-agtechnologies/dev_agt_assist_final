"use client";
// src/components/forms/FormField.tsx

import { type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, id, className = "", ...inputProps }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-[var(--text)]"
      >
        {label}
        {inputProps.required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
      </label>

      <input
        id={fieldId}
        className={[
          "w-full px-3 py-2 rounded-lg border text-sm",
          "bg-[var(--bg)] text-[var(--text)]",
          "placeholder:text-[var(--text-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-[var(--border)] hover:border-[var(--primary)]/50",
          className,
        ].join(" ")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...inputProps}
      />

      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${fieldId}-hint`} className="text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}
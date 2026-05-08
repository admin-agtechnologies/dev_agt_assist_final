"use client";
// src/components/forms/SelectInput.tsx

import { type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function SelectInput({
  label,
  options,
  placeholder,
  error,
  id,
  className = "",
  ...selectProps
}: SelectInputProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-[var(--text)]"
      >
        {label}
        {selectProps.required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
      </label>

      <select
        id={fieldId}
        className={[
          "w-full px-3 py-2 rounded-lg border text-sm",
          "bg-[var(--bg)] text-[var(--text)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-[var(--border)] hover:border-[var(--primary)]/50",
          className,
        ].join(" ")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
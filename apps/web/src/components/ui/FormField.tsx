"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";

export interface FormFieldProps {
  id?: string;
  label?: string;
  error?: string | null;
  isValid?: boolean;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  isValid,
  helperText,
  required,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          {isValid && !error && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 stroke-[2.5]" />
              <span>Valid</span>
            </span>
          )}
        </div>
      )}

      {children}

      {error ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in duration-150">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  isValid?: boolean;
  helperText?: string;
  containerClassName?: string;
}

export function ValidatedInput({
  label,
  error,
  isValid,
  helperText,
  containerClassName = "",
  className = "",
  type = "text",
  required,
  id,
  ...props
}: ValidatedInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);

  // Determine border and ring styles based on validation state
  let stateClasses = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20";
  if (error) {
    stateClasses = "border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100";
  } else if (isValid) {
    stateClasses = "border-emerald-400 dark:border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/20";
  }

  return (
    <FormField
      id={inputId}
      label={label}
      error={error}
      isValid={isValid}
      helperText={helperText}
      required={required}
      className={containerClassName}
    >
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={actualType}
          required={required}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 transition-colors ${stateClasses} ${
            isPassword ? "pr-10" : ""
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </FormField>
  );
}

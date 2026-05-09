import { ReactNode } from "react";
import { FieldError } from "./FieldError";

interface Props {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}

export function InputField({ label, id, error, children }: Props) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-xs font-bold tracking-widest uppercase text-slate-400 mb-1.5"
      >
        {label}
      </label>
      {children}
      <FieldError message={error ?? ""} id={`${id}-err`} />
    </div>
  );
}
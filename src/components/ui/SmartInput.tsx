"use client";
import { InputHTMLAttributes, useState } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string;
  onBlurCapture?: () => void;
}

export function SmartInput({ id, error, onBlurCapture, className = "", ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      id={id}
      aria-describedby={error ? `${id}-err` : undefined}
      aria-invalid={!!error}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlurCapture?.(); }}
      autoComplete="off"
      className={[
        "w-full rounded-xl px-3.5 py-3 text-sm text-slate-100 bg-white/5 border transition-all outline-none",
        focused ? "border-violet-500/60 bg-violet-500/5" : "border-white/10",
        error ? "border-red-400/50" : "",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
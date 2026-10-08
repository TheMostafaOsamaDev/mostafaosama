"use client";

import { useId } from "react";

/** Two or three mutually exclusive options, as a radio group. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="grid gap-1.5">
      <legend className="text-small text-muted">{label}</legend>
      <div className="inline-flex w-max rounded-[2px] border border-hairline p-0.5">
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded-[2px] px-3 py-1 text-small transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-crit ${
              value === o.value ? "bg-ink text-paper" : "text-muted hover:text-ink"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format = String,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="flex justify-between gap-4 text-small">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">{format(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-crit"
      />
    </div>
  );
}

export function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-max rounded-[2px] border border-hairline px-3 py-1 text-small transition-colors duration-150 hover:border-ink"
    >
      {children}
    </button>
  );
}

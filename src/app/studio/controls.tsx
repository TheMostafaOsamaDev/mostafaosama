"use client";

import { useId, type ReactNode } from "react";

/** Controls shared by the dev-only studios (/studio/nav, /studio/home). Styles: nav/studio.css. */

const LABELS: Record<string, string> = { "in-out": "In-out", reduce: "Reduced" };
export const title = (v: string) => LABELS[v] ?? v[0].toUpperCase() + v.slice(1);

export function Section({ title: heading, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="space-y-3.5">
      <div>
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{heading}</h3>
        {note && <p className="mt-1 text-xs leading-snug text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export function Choice({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <label key={o} className="studio-chip">
            <input type="radio" name={group} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
            {title(o)}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-xs leading-snug text-muted">{hint}</p>}
    </fieldset>
  );
}

export function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const group = useId();
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className="w-14 text-xs text-muted">
        {label}
      </span>
      <div className="nav-seg">
        {options.map((o) => (
          <label key={o}>
            <input type="radio" name={group} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
            {title(o)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  note,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  note?: string;
}) {
  const id = useId();
  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <div className="mb-1 flex justify-between">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="text-muted tabular-nums">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
      />
      {note && <p className="mt-1 text-xs leading-snug text-muted">{note}</p>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-current"
      />
      <span>{label}</span>
    </label>
  );
}

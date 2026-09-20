// Small shared presentational controls used across the settings panel's
// sections, so the stepper/toggle markup isn't repeated at every call site.
import type { CSSProperties } from "react";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}: StepperProps) {
  return (
    <div className="settings-panel__row">
      <span className="settings-panel__label">{label}</span>
      <div className="settings-panel__stepper">
        <button
          type="button"
          aria-label={`减少${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          −
        </button>
        <span className="settings-panel__stepper-value">
          {formatValue ? formatValue(value) : value}
        </span>
        <button
          type="button"
          aria-label={`增加${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
  formatValue,
}: SliderProps) {
  return (
    <div className="settings-panel__section">
      <div className="settings-panel__slider-header">
        <span className="settings-panel__label">{label}</span>
        <span className="settings-panel__stepper-value">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="settings-panel__slider"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

interface SelectOption {
  id: string;
  label: string;
  // Lets an <option> preview itself in its own style — e.g. a font choice
  // rendered in that font.
  style?: CSSProperties;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (id: string) => void;
}

// A compact native dropdown — used where a chip-grid of buttons (font,
// paper style, playback order) would take up more room than the panel can
// spare, especially now that those lists keep growing.
export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="settings-panel__row">
      <span className="settings-panel__label">{label}</span>
      <select
        className="settings-panel__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id} style={option.style}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="settings-panel__toggle-row">
      <span>{label}</span>
      <span className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="toggle-switch__track" />
      </span>
    </label>
  );
}

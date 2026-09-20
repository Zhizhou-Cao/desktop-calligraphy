export type PlaybackMode =
  | "pause"
  | "forward"
  | "backward"
  | "random"
  | "favorite";

export interface LibraryState {
  mode: PlaybackMode;
  currentIndex: number;
  // Seconds between automatic advances when mode isn't "pause".
  intervalSeconds: number;
}

export interface FrequencyOption {
  seconds: number;
  label: string;
}

// Presets only — anything else (including fractional minutes like 0.5)
// comes from the custom minutes field next to these in the UI.
export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { seconds: 60, label: "1分钟" },
  { seconds: 300, label: "5分钟" },
  { seconds: 600, label: "10分钟" },
];

export const CUSTOM_INTERVAL_MIN_MINUTES = 0.5;

export const DEFAULT_LIBRARY_STATE: LibraryState = {
  mode: "pause",
  currentIndex: 0,
  intervalSeconds: 60,
};

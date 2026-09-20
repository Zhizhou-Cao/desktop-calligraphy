import {
  CUSTOM_INTERVAL_MIN_MINUTES,
  FREQUENCY_OPTIONS,
  type PlaybackMode,
} from "../../types/library";
import { Select } from "./SettingsControls";

interface LibrarySectionProps {
  mode: PlaybackMode;
  intervalSeconds: number;
  onModeChange: (mode: PlaybackMode) => void;
  onIntervalChange: (seconds: number) => void;
}

const MODE_OPTIONS: { id: PlaybackMode; label: string }[] = [
  { id: "pause", label: "暂停" },
  { id: "forward", label: "正序" },
  { id: "backward", label: "倒序" },
  { id: "random", label: "随机" },
  // Cycles only through phrases starred in the library popup — see
  // usePhraseRotation.ts for how it filters by favorite.
  { id: "favorite", label: "收藏" },
];

// Which phrase is showing, plus adding/editing/deleting entries, live in
// their own popup below the paper (components/LibraryPopup.tsx) — it opens
// and closes together with this settings panel, no button of its own.
// This section only keeps the rotation behavior itself: order and how
// often it advances.
export function LibrarySection({
  mode,
  intervalSeconds,
  onModeChange,
  onIntervalChange,
}: LibrarySectionProps) {
  const isPreset = FREQUENCY_OPTIONS.some(
    (option) => option.seconds === intervalSeconds,
  );

  function handleCustomMinutes(raw: string) {
    const parsed = Number(raw);
    const minutes = Number.isFinite(parsed)
      ? Math.max(CUSTOM_INTERVAL_MIN_MINUTES, parsed)
      : CUSTOM_INTERVAL_MIN_MINUTES;
    onIntervalChange(Math.round(minutes * 60));
  }

  return (
    <>
      <Select
        label="展示顺序"
        value={mode}
        options={MODE_OPTIONS}
        onChange={(value) => onModeChange(value as PlaybackMode)}
      />

      <div className="settings-panel__section">
        <span className="settings-panel__label">切换频次</span>
        <div className="settings-panel__chip-grid">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.seconds}
              type="button"
              className={intervalSeconds === option.seconds ? "is-active" : ""}
              onClick={() => onIntervalChange(option.seconds)}
            >
              {option.label}
            </button>
          ))}
          <label
            className={`settings-panel__custom-interval${
              !isPreset ? " is-active" : ""
            }`}
          >
            <input
              type="number"
              min={CUSTOM_INTERVAL_MIN_MINUTES}
              step={0.5}
              value={intervalSeconds / 60}
              onChange={(event) => handleCustomMinutes(event.target.value)}
            />
            <span>分钟</span>
          </label>
        </div>
      </div>
    </>
  );
}

export default LibrarySection;

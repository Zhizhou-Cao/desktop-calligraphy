import { LibrarySection } from "./settings/LibrarySection";
import { TypographySection } from "./settings/TypographySection";
import { WindowSection } from "./settings/WindowSection";
import type { CalligraphySettings } from "../types/calligraphy";
import type { PlaybackMode } from "../types/library";
import type { WindowBehaviorSettings } from "../types/windowBehavior";
import "./SettingsPanel.css";

interface SettingsPanelProps {
  settings: CalligraphySettings;
  onChange: (patch: Partial<CalligraphySettings>) => void;
  libraryMode: PlaybackMode;
  libraryIntervalSeconds: number;
  onLibraryModeChange: (mode: PlaybackMode) => void;
  onLibraryIntervalChange: (seconds: number) => void;
  windowBehavior: WindowBehaviorSettings;
  onWindowBehaviorChange: (patch: Partial<WindowBehaviorSettings>) => void;
  onClose: () => void;
}

// Sits beside the paper (not on top of it) as a normal flex sibling — see
// .composition in App.css. Every handler stops propagation so interacting
// with the panel never triggers the window drag / lock-toggle logic on
// .stage behind it. Content is split into sections (typography / library /
// window) so each stays independently readable as more settings get added.
//
// The body (everything but the window-behavior footer) scrolls on its own;
// 画布锁定 sits in a footer pinned to the bottom of the panel instead of
// scrolling away with the rest — see .settings-panel__footer in the CSS.
export function SettingsPanel({
  settings,
  onChange,
  libraryMode,
  libraryIntervalSeconds,
  onLibraryModeChange,
  onLibraryIntervalChange,
  windowBehavior,
  onWindowBehaviorChange,
  onClose,
}: SettingsPanelProps) {
  return (
    <div
      className="settings-panel"
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="settings-panel__scroll">
        <div className="settings-panel__header">
          <span className="settings-panel__title">设置</span>
          <button
            type="button"
            className="settings-panel__close"
            aria-label="关闭设置"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <TypographySection settings={settings} onChange={onChange} />

        <div className="settings-panel__divider" />

        <LibrarySection
          mode={libraryMode}
          intervalSeconds={libraryIntervalSeconds}
          onModeChange={onLibraryModeChange}
          onIntervalChange={onLibraryIntervalChange}
        />
      </div>

      <div className="settings-panel__footer">
        <WindowSection
          windowBehavior={windowBehavior}
          onChange={onWindowBehaviorChange}
        />
      </div>
    </div>
  );
}

export default SettingsPanel;

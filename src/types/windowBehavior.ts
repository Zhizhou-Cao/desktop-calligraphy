// Window-level behavior settings — distinct from CalligraphySettings
// (which only governs how the text itself is laid out). More of these
// will likely show up later (click-through, always-on-bottom, ...).
export interface WindowBehaviorSettings {
  alwaysOnTop: boolean;
  // "仅在此页" — when true, the window only shows on the macOS Space
  // (virtual desktop) it's currently on, instead of following you to every
  // Space. See set_all_spaces in src-tauri/src/lib.rs.
  onlyCurrentSpace: boolean;
}

export const DEFAULT_WINDOW_BEHAVIOR: WindowBehaviorSettings = {
  alwaysOnTop: true,
  onlyCurrentSpace: false,
};

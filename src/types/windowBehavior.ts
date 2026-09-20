// Window-level behavior settings — distinct from CalligraphySettings
// (which only governs how the text itself is laid out). More of these
// will likely show up later (click-through, always-on-bottom, ...).
export interface WindowBehaviorSettings {
  alwaysOnTop: boolean;
}

export const DEFAULT_WINDOW_BEHAVIOR: WindowBehaviorSettings = {
  alwaysOnTop: true,
};

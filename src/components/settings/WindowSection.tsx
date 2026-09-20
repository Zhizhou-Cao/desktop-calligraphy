import type { WindowBehaviorSettings } from "../../types/windowBehavior";
import { ToggleRow } from "./SettingsControls";

interface WindowSectionProps {
  windowBehavior: WindowBehaviorSettings;
  onChange: (patch: Partial<WindowBehaviorSettings>) => void;
}

export function WindowSection({ windowBehavior, onChange }: WindowSectionProps) {
  return (
    <>
      <ToggleRow
        label="画布锁定"
        checked={windowBehavior.alwaysOnTop}
        onChange={(value) => onChange({ alwaysOnTop: value })}
      />
      <ToggleRow
        label="仅在此页"
        checked={windowBehavior.onlyCurrentSpace}
        onChange={(value) => onChange({ onlyCurrentSpace: value })}
      />
    </>
  );
}

export default WindowSection;

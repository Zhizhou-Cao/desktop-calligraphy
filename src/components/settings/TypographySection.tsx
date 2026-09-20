import {
  ALIGNMENT_MAX,
  ALIGNMENT_MIN,
  CHAR_SPACING_MAX,
  CHAR_SPACING_MIN,
  CHAR_SPACING_STEP,
  FONT_OPTIONS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  PADDING_MAX,
  PADDING_MIN,
  PAPER_OPACITY_MAX,
  PAPER_OPACITY_MIN,
  PAPER_STYLE_OPTIONS,
  type CalligraphySettings,
  type Direction,
} from "../../types/calligraphy";
import { Select, Slider, Stepper, ToggleRow } from "./SettingsControls";

interface TypographySectionProps {
  settings: CalligraphySettings;
  onChange: (patch: Partial<CalligraphySettings>) => void;
}

export function TypographySection({
  settings,
  onChange,
}: TypographySectionProps) {
  const setDirection = (direction: Direction) => onChange({ direction });

  return (
    <>
      <div className="settings-panel__section">
        <span className="settings-panel__label">方向</span>
        <div className="settings-panel__segmented">
          <button
            type="button"
            className={settings.direction === "horizontal" ? "is-active" : ""}
            onClick={() => setDirection("horizontal")}
          >
            横排
          </button>
          <button
            type="button"
            className={settings.direction === "vertical" ? "is-active" : ""}
            onClick={() => setDirection("vertical")}
          >
            竖排
          </button>
        </div>
      </div>

      <ToggleRow
        label="分行"
        checked={settings.lineBreak}
        onChange={(value) => onChange({ lineBreak: value })}
      />

      <ToggleRow
        label="标点"
        checked={settings.showPunctuation}
        onChange={(value) => onChange({ showPunctuation: value })}
      />

      <Stepper
        label="错位对齐"
        value={settings.alignment}
        min={ALIGNMENT_MIN}
        max={ALIGNMENT_MAX}
        onChange={(value) => onChange({ alignment: value })}
      />

      <Stepper
        label="边距"
        value={settings.padding}
        min={PADDING_MIN}
        max={PADDING_MAX}
        onChange={(value) => onChange({ padding: value })}
      />

      {/* fontFamily/fontSize below are the only controls that affect the
          glyphs themselves — direction/lineBreak/showPunctuation above
          never touch them (see CalligraphyText.tsx). */}
      <Stepper
        label="大小"
        value={settings.fontSize}
        min={FONT_SIZE_MIN}
        max={FONT_SIZE_MAX}
        step={FONT_SIZE_STEP}
        formatValue={(value) => `${value}px`}
        onChange={(value) => onChange({ fontSize: value })}
      />

      <Select
        label="字体"
        value={settings.fontFamily}
        options={FONT_OPTIONS.map((font) => ({
          id: font.id,
          label: font.label,
          style: { fontFamily: font.stack },
        }))}
        onChange={(fontFamily) => onChange({ fontFamily })}
      />

      <ToggleRow
        label="加粗"
        checked={settings.bold}
        onChange={(value) => onChange({ bold: value })}
      />

      <Stepper
        label="字距"
        value={settings.charSpacing}
        min={CHAR_SPACING_MIN}
        max={CHAR_SPACING_MAX}
        step={CHAR_SPACING_STEP}
        formatValue={(value) => value.toFixed(2)}
        onChange={(value) => onChange({ charSpacing: Math.round(value * 100) / 100 })}
      />

      <Select
        label="纸张"
        value={settings.paperStyle}
        options={PAPER_STYLE_OPTIONS.map((style) => ({
          id: style.id,
          label: style.label,
        }))}
        onChange={(paperStyle) => onChange({ paperStyle })}
      />

      <Slider
        label="透明度"
        value={settings.paperOpacity}
        min={PAPER_OPACITY_MIN}
        max={PAPER_OPACITY_MAX}
        formatValue={(value) => `${value}%`}
        onChange={(value) => onChange({ paperOpacity: value })}
      />
    </>
  );
}

export default TypographySection;

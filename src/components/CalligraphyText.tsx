import type { CSSProperties } from "react";
import { FONT_OPTIONS, type CalligraphySettings } from "../types/calligraphy";
import {
  buildSegments,
  computeAlignmentOffsets,
  stripPunctuation,
} from "../lib/calligraphyLayout";
import "./CalligraphyText.css";

interface CalligraphyTextProps extends CalligraphySettings {
  text: string;
}

export function CalligraphyText({
  text,
  direction,
  lineBreak,
  showPunctuation,
  alignment,
  fontFamily,
  fontSize,
  bold,
  charSpacing,
}: CalligraphyTextProps) {
  const segments = buildSegments(text, lineBreak).map((segment) =>
    showPunctuation ? segment : stripPunctuation(segment, lineBreak),
  );
  const offsets = computeAlignmentOffsets(segments.length, alignment);

  // Horizontal lines step sideways (marginLeft); vertical columns step
  // downward (marginTop). The unit is "em" of the segment's own font-size,
  // so one step always reads as roughly one character cell and rescales
  // automatically if the font size ever changes.
  const offsetProperty: keyof CSSProperties =
    direction === "horizontal" ? "marginLeft" : "marginTop";

  // font-family/font-size/bold/charSpacing are the ONLY things that control
  // how the glyphs themselves look — deliberately the same regardless of
  // direction, lineBreak, or punctuation, so switching those never shifts
  // the type.
  const fontStack =
    FONT_OPTIONS.find((option) => option.id === fontFamily)?.stack ??
    FONT_OPTIONS[0].stack;

  return (
    <div
      className={`calligraphy-text calligraphy-text--${direction}`}
      style={{
        fontFamily: fontStack,
        fontSize: `${fontSize}px`,
        fontWeight: bold ? 700 : 400,
      }}
    >
      {segments.map((segment, index) => (
        <p
          className="calligraphy-text__segment"
          key={index}
          style={{ [offsetProperty]: `${offsets[index]}em`, gap: `${charSpacing}em` }}
        >
          {/* Array.from splits by Unicode code point, not UTF-16 code
              unit, so rarer CJK characters outside the BMP stay intact. */}
          {Array.from(segment).map((char, charIndex) => (
            <span key={charIndex}>{char}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default CalligraphyText;

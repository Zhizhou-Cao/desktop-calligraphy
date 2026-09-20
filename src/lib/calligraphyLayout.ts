// Pure text-layout logic, independent of rendering and of paper/window
// sizing. Given raw text + settings, these functions decide what each
// line/column's content is and how far it should be stepped — never how
// big anything ends up on screen. Paper/window sizing instead measures the
// real rendered DOM (see hooks/useAutoResizeWindow.ts), so it always
// matches actual font metrics without duplicating them here.

// CJK + common full-width/half-width punctuation that "showPunctuation"
// strips.
const PUNCTUATION_REGEX =
  /[，。、；：？！""''（）《》【】—…,.;:?!()]/g;
const FULLWIDTH_SPACE = "　";

// How a stripped punctuation mark is replaced depends on whether it still
// needs to separate two clauses:
//  - lineBreak on: each segment is already its own line/column, so the
//    line break itself separates what the punctuation used to separate —
//    removing it outright doesn't leave a gap in the paper's sizing.
//  - lineBreak off: multiple original lines are joined into one flowing
//    segment, so removing the punctuation with nothing in its place would
//    glue two clauses together (e.g. "山高月小水落石出"). A full-width
//    space keeps them visually separated without showing a punctuation
//    mark.
export function stripPunctuation(segment: string, lineBreak: boolean): string {
  return segment.replace(PUNCTUATION_REGEX, lineBreak ? "" : FULLWIDTH_SPACE);
}

// A "segment" is one rendered line (horizontal) or one column (vertical).
// With lineBreak off, the whole text collapses into a single segment —
// this stage does not guess where a line should break.
export function buildSegments(text: string, lineBreak: boolean): string[] {
  const rawLines = text.split("\n");
  return lineBreak ? rawLines : [rawLines.join("")];
}

// Stepped offset for each segment, in whole character cells:
//  - alignment > 0: the FIRST segment is the anchor (offset 0), later
//    segments step forward — offset(i) = i * alignment.
//  - alignment < 0: the LAST segment is the anchor (offset 0), earlier
//    segments step forward instead — offset(i) = (count - 1 - i) * |alignment|.
//  - alignment === 0, or a single segment: no relative offset to apply.
export function computeAlignmentOffsets(
  count: number,
  alignment: number,
): number[] {
  if (count <= 1 || alignment === 0) {
    return new Array(count).fill(0);
  }
  const step = Math.abs(alignment);
  return Array.from({ length: count }, (_, i) =>
    alignment > 0 ? i * step : (count - 1 - i) * step,
  );
}

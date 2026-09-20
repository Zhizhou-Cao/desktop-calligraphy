export type Direction = "horizontal" | "vertical";

export interface FontOption {
  id: string;
  label: string;
  stack: string;
}

// A small curated set of built-in macOS system CJK fonts — no external
// font files. Each has a sane fallback chain in case a given face isn't
// installed on a particular machine.
export const FONT_OPTIONS: FontOption[] = [
  {
    id: "kaiti",
    label: "楷体",
    stack: '"STKaiti", "Kaiti SC", "Songti SC", serif',
  },
  {
    id: "songti",
    label: "宋体",
    stack: '"Songti SC", "STSong", "Kaiti SC", serif',
  },
  {
    id: "heiti",
    label: "黑体",
    stack: '"PingFang SC", "Heiti SC", sans-serif',
  },
  {
    id: "xingkai",
    label: "行楷",
    stack: '"Xingkai SC", "STXingkai", "Kaiti SC", serif',
  },
  {
    id: "lishu",
    label: "隶书",
    stack: '"Libian SC", "STLiti", "Kaiti SC", serif',
  },
  {
    id: "hanli",
    label: "汉隶",
    stack: '"Baoli SC", "STLiti", "Libian SC", serif',
  },
  {
    id: "fangsong",
    label: "仿宋",
    stack: '"STFangsong", "Fangsong SC", "Songti SC", serif',
  },
  {
    id: "weibei",
    label: "魏碑",
    stack: '"Weibei SC", "STKaiti", "Kaiti SC", serif',
  },
  {
    id: "yuanti",
    label: "圆体",
    stack: '"Yuanti SC", "PingFang SC", sans-serif',
  },
];

export interface PaperStyleOption {
  id: string;
  label: string;
}

// CSS-only paper textures (no images) — see the .paper--<id> rules in
// App.css for what each one actually looks like.
export const PAPER_STYLE_OPTIONS: PaperStyleOption[] = [
  { id: "rice", label: "米宣" },
  { id: "azure", label: "青宣" },
  { id: "aged", label: "陈宣" },
  { id: "plain", label: "素白" },
];

export interface CalligraphySettings {
  direction: Direction;
  lineBreak: boolean;
  showPunctuation: boolean;
  // Stepped offset applied between lines/columns, in whole character
  // cells (1 cell ≈ 1em of the text's own font-size). See
  // computeAlignmentOffsets in lib/calligraphyLayout.ts for the exact rule.
  alignment: number;
  // Blank margin kept between the text and the paper's own edge, in
  // whole steps of PADDING_UNIT_PX. 0 = the text sits almost flush
  // against the paper's edge on all four sides.
  padding: number;
  // One of FONT_OPTIONS' ids. Deliberately the ONLY thing that controls
  // font — direction/lineBreak/showPunctuation must never change it.
  fontFamily: string;
  // In px. Same note as fontFamily: constant across direction/lineBreak/
  // showPunctuation changes.
  fontSize: number;
  // Bold on/off. Same note as fontFamily/fontSize.
  bold: boolean;
  // Gap between adjacent characters within a line/column, in em of the
  // text's own font-size — NOT the gap between separate lines/columns
  // (that one stays fixed in CalligraphyText.css; it's more about overall
  // layout than glyph spacing). Same note as fontFamily/fontSize.
  charSpacing: number;
  // One of PAPER_STYLE_OPTIONS' ids.
  paperStyle: string;
  // 0-100. How opaque the paper's own background/texture is — 100 is
  // fully solid, 0 is fully see-through to the desktop behind it. Only
  // affects the background layer (.paper__backdrop), never the text.
  paperOpacity: number;
}

export const ALIGNMENT_MIN = -5;
export const ALIGNMENT_MAX = 5;

export const PADDING_MIN = 0;
export const PADDING_MAX = 5;
export const PADDING_UNIT_PX = 12;

export const FONT_SIZE_MIN = 16;
export const FONT_SIZE_MAX = 36;
export const FONT_SIZE_STEP = 2;

export const CHAR_SPACING_MIN = 0;
export const CHAR_SPACING_MAX = 1;
export const CHAR_SPACING_STEP = 0.05;

export const PAPER_OPACITY_MIN = 0;
export const PAPER_OPACITY_MAX = 100;

export const DEFAULT_SETTINGS: CalligraphySettings = {
  direction: "horizontal",
  lineBreak: false,
  showPunctuation: true,
  alignment: 0,
  padding: 2,
  fontFamily: "kaiti",
  fontSize: 24,
  bold: false,
  charSpacing: 0.3,
  paperStyle: "rice",
  paperOpacity: 100,
};

import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

// Breathing room between the paper's own edge and the window's edge, so
// the paper's drop shadow has room to render instead of being clipped.
const OUTER_MARGIN = 14;

const MIN_WIDTH = 160;
const MIN_HEIGHT = 140;
const MAX_WIDTH = 900;
const MAX_HEIGHT = 700;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface Point {
  x: number;
  y: number;
}

interface Size {
  w: number;
  h: number;
}

/**
 * Keeps the (transparent, borderless) Tauri window's outer size matched to
 * two DOM elements: the "paper" (the calligraphy card itself) and the
 * "composition" wrapping it — which also includes the settings panel when
 * it's open, sitting beside the paper on whichever side App.tsx rendered
 * it.
 *
 * The paper's own on-screen position is tracked as an anchor and is only
 * ever recomputed when the PAPER's own size changes (a direction/lineBreak/
 * alignment/padding change) — recentering it the same way the previous
 * version centered the whole window. When only the composition changes
 * (the settings panel opening/closing beside an unchanged paper), the
 * anchor is left untouched, so the paper never visibly moves — only the
 * window's edge on the panel's side grows or shrinks.
 */
export function useAutoResizeWindow<
  TComposition extends HTMLElement,
  TPaper extends HTMLElement,
>() {
  const compositionRef = useRef<TComposition | null>(null);
  const paperRef = useRef<TPaper | null>(null);

  // Physical-pixel on-screen position of the paper's own top-left corner.
  const paperAnchor = useRef<Point | null>(null);
  const lastPaperSize = useRef<Size | null>(null);
  const lastTargetSize = useRef<Size | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    const compositionEl = compositionRef.current;
    const paperEl = paperRef.current;
    if (!compositionEl || !paperEl) return;

    const observer = new ResizeObserver(() => {
      const compositionRect = compositionEl.getBoundingClientRect();
      const paperRect = paperEl.getBoundingClientRect();

      const targetWidth = clamp(
        Math.ceil(compositionRect.width) + OUTER_MARGIN * 2,
        MIN_WIDTH,
        MAX_WIDTH,
      );
      const targetHeight = clamp(
        Math.ceil(compositionRect.height) + OUTER_MARGIN * 2,
        MIN_HEIGHT,
        MAX_HEIGHT,
      );

      const paperSize: Size = { w: paperRect.width, h: paperRect.height };
      const previousPaperSize = lastPaperSize.current;
      const paperSizeChanged =
        !previousPaperSize ||
        Math.round(previousPaperSize.w) !== Math.round(paperSize.w) ||
        Math.round(previousPaperSize.h) !== Math.round(paperSize.h);

      const previousTarget = lastTargetSize.current;
      const targetUnchanged =
        previousTarget &&
        previousTarget.w === targetWidth &&
        previousTarget.h === targetHeight;

      if (targetUnchanged && !paperSizeChanged) return;

      lastTargetSize.current = { w: targetWidth, h: targetHeight };
      lastPaperSize.current = paperSize;

      const myGeneration = ++generation.current;
      void applyResize({
        targetWidth,
        targetHeight,
        paperSize,
        previousPaperSize,
        paperSizeChanged,
        // Paper's offset from the composition's own top-left, in logical
        // px — tells us which side of the composition the paper is on
        // (≈0 if paper is first / panel is on the right or absent).
        paperOffsetX: paperRect.left - compositionRect.left,
        paperOffsetY: paperRect.top - compositionRect.top,
        anchorRef: paperAnchor,
        myGeneration,
        generationRef: generation,
      });
    });

    observer.observe(compositionEl);
    observer.observe(paperEl);
    return () => observer.disconnect();
  }, []);

  // Keeps the anchor in sync with the window's REAL on-screen position.
  // Without this, dragging the window (double-click-unlock, then drag) only
  // ever moves the OS window — the anchor we use for the next size-driven
  // reposition never heard about that move, so it kept pointing at wherever
  // the window started (e.g. tauri.conf.json's initial centered position).
  // The next time anything resized the window (opening settings), it would
  // snap back there. This listens to every window-moved event — including
  // the ones our own resize_and_reposition calls trigger, which is fine:
  // recomputing the anchor from the position we just set reproduces the
  // same anchor value, so it's a no-op in that case.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    appWindow
      .onMoved(async ({ payload: position }) => {
        const paperEl = paperRef.current;
        const compositionEl = compositionRef.current;
        if (!paperEl || !compositionEl) return;

        const scale = await appWindow.scaleFactor();
        const paperRect = paperEl.getBoundingClientRect();
        const compositionRect = compositionEl.getBoundingClientRect();
        const paperOffsetX = paperRect.left - compositionRect.left;
        const paperOffsetY = paperRect.top - compositionRect.top;

        paperAnchor.current = {
          x: position.x + OUTER_MARGIN * scale + paperOffsetX * scale,
          y: position.y + OUTER_MARGIN * scale + paperOffsetY * scale,
        };
      })
      .then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return { compositionRef, paperRef };
}

async function applyResize(args: {
  targetWidth: number;
  targetHeight: number;
  paperSize: Size;
  previousPaperSize: Size | null;
  paperSizeChanged: boolean;
  paperOffsetX: number;
  paperOffsetY: number;
  anchorRef: { current: Point | null };
  myGeneration: number;
  generationRef: { current: number };
}) {
  const {
    targetWidth,
    targetHeight,
    paperSize,
    previousPaperSize,
    paperSizeChanged,
    paperOffsetX,
    paperOffsetY,
    anchorRef,
    myGeneration,
    generationRef,
  } = args;

  try {
    const [oldPosition, scale] = await Promise.all([
      appWindow.outerPosition(),
      appWindow.scaleFactor(),
    ]);
    if (generationRef.current !== myGeneration) return;

    let anchor = anchorRef.current;
    if (!anchor) {
      // First run: bootstrap the anchor from the window's current position,
      // assuming the paper starts flush at the top-left (no panel yet).
      anchor = {
        x: oldPosition.x + OUTER_MARGIN * scale,
        y: oldPosition.y + OUTER_MARGIN * scale,
      };
    } else if (paperSizeChanged && previousPaperSize) {
      // The paper's own content changed size — recenter the anchor on the
      // paper's previous center point, exactly like the old "keep window
      // center fixed" behavior, just scoped to the paper instead of the
      // whole (possibly panel-widened) window.
      anchor = {
        x: anchor.x + ((previousPaperSize.w - paperSize.w) * scale) / 2,
        y: anchor.y + ((previousPaperSize.h - paperSize.h) * scale) / 2,
      };
    }
    // Else: only the composition changed (settings panel opening/closing
    // beside an unchanged paper) — the anchor is left exactly as-is, so
    // the paper does not move.
    anchorRef.current = anchor;

    const windowX = anchor.x - OUTER_MARGIN * scale - paperOffsetX * scale;
    const windowY = anchor.y - OUTER_MARGIN * scale - paperOffsetY * scale;

    // A single Rust-side command sets both size and position (see
    // resize_and_reposition in src-tauri/src/lib.rs). Doing this as two
    // separate JS calls — even fired together via Promise.all — still
    // reaches the native window as two separate IPC round trips, and
    // macOS was visibly resizing from a different anchor corner before the
    // follow-up position landed. One command keeps both native calls on
    // the same event-loop turn, with nothing left to correct afterward.
    await invoke("resize_and_reposition", {
      width: targetWidth,
      height: targetHeight,
      x: Math.round(windowX),
      y: Math.round(windowY),
    });
  } catch {
    // Best-effort: the window may already be gone, or the webview may not
    // be ready yet on the very first paint. Nothing to recover here.
  }
}

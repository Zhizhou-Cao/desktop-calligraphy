import { useCallback, useEffect, useState } from "react";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";
import { CalligraphyText } from "./components/CalligraphyText";
import { LibraryPopup } from "./components/LibraryPopup";
import { SettingsButton } from "./components/SettingsButton";
import { SettingsPanel } from "./components/SettingsPanel";
import { PHRASES } from "./data/phrases";
import { useAutoResizeWindow } from "./hooks/useAutoResizeWindow";
import { usePhraseRotation } from "./hooks/usePhraseRotation";
import {
  DEFAULT_SETTINGS,
  PADDING_UNIT_PX,
  type CalligraphySettings,
} from "./types/calligraphy";
import { DEFAULT_LIBRARY_STATE, type PlaybackMode } from "./types/library";
import type { PhraseEntry } from "./types/phrase";
import {
  DEFAULT_WINDOW_BEHAVIOR,
  type WindowBehaviorSettings,
} from "./types/windowBehavior";
import "./App.css";

const appWindow = getCurrentWindow();

// Settings panel's own footprint (see SettingsPanel.css: width 200px) plus
// the gap .composition puts between it and the paper — used only to decide
// which side has room for it, not to size anything.
const PANEL_FOOTPRINT_LOGICAL = 200 + 12;

type PanelSide = "left" | "right";

function App() {
  const [movable, setMovable] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelSide, setPanelSide] = useState<PanelSide>("right");
  const [settings, setSettings] = useState<CalligraphySettings>(DEFAULT_SETTINGS);
  const [windowBehavior, setWindowBehavior] = useState<WindowBehaviorSettings>(
    DEFAULT_WINDOW_BEHAVIOR,
  );
  const [library, setLibrary] = useState(DEFAULT_LIBRARY_STATE);
  // Single mutable list — seeded from the built-in PHRASES, but every
  // entry (built-in or later added) can be edited/deleted/favorited
  // equally from here on. Not persisted across restarts.
  const [phrases, setPhrases] = useState<PhraseEntry[]>(() =>
    PHRASES.map((text) => ({ text, favorite: false })),
  );

  // Tracks the paper's own on-screen position; opening/closing a popup
  // beside or below it never moves that anchor, only the window edges on
  // the side(s) those popups occupy. See hooks/useAutoResizeWindow.ts.
  const { compositionRef, paperRef } = useAutoResizeWindow<
    HTMLDivElement,
    HTMLDivElement
  >();

  // Mirrors the paper's own rendered width so LibraryPopup can match it
  // exactly ("和画布一样宽") instead of using a width of its own.
  const [paperWidth, setPaperWidth] = useState<number>();
  useEffect(() => {
    const element = paperRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setPaperWidth(element.getBoundingClientRect().width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [paperRef]);

  // Stable identity (empty deps) so the rotation timer in usePhraseRotation
  // isn't torn down and restarted on every unrelated re-render of App.
  const setCurrentPhraseIndex = useCallback(
    (updater: (prev: number) => number) => {
      setLibrary((prev) => ({
        ...prev,
        currentIndex: updater(prev.currentIndex),
      }));
    },
    [],
  );

  usePhraseRotation(
    library.mode,
    phrases,
    library.intervalSeconds,
    setCurrentPhraseIndex,
  );

  useEffect(() => {
    appWindow.setAlwaysOnTop(windowBehavior.alwaysOnTop).catch(() => {
      // Best-effort — nothing to recover if the window is already gone.
    });
  }, [windowBehavior.alwaysOnTop]);

  function toggleMovable() {
    setMovable((prev) => {
      const next = !prev;
      // Locking the window again also hides the settings panel (and with
      // it the library popup, which now just mirrors settingsOpen), so
      // the UI never shows one open with no button left to reach it.
      if (!next) {
        setSettingsOpen(false);
      }
      return next;
    });
  }

  async function openSettings() {
    // Default to the right; only flip to the left if there's genuinely
    // not enough room on the current monitor's usable area.
    let side: PanelSide = "right";
    try {
      const [monitor, position, size, scale] = await Promise.all([
        currentMonitor(),
        appWindow.outerPosition(),
        appWindow.outerSize(),
        appWindow.scaleFactor(),
      ]);
      if (monitor) {
        const spaceRight =
          monitor.workArea.position.x +
          monitor.workArea.size.width -
          (position.x + size.width);
        const needed = PANEL_FOOTPRINT_LOGICAL * scale;
        side = spaceRight >= needed ? "right" : "left";
      }
    } catch {
      // Best-effort — fall back to the default right-hand side.
    }
    setPanelSide(side);
    setSettingsOpen(true);
  }

  function updateSettings(patch: Partial<CalligraphySettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function updateWindowBehavior(patch: Partial<WindowBehaviorSettings>) {
    setWindowBehavior((prev) => ({ ...prev, ...patch }));
  }

  function setLibraryMode(mode: PlaybackMode) {
    setLibrary((prev) => ({ ...prev, mode }));
  }

  function setLibraryInterval(intervalSeconds: number) {
    setLibrary((prev) => ({ ...prev, intervalSeconds }));
  }

  function selectPhrase(index: number) {
    setLibrary((prev) => ({ ...prev, currentIndex: index }));
  }

  function importPhrases(texts: string[]) {
    if (texts.length === 0) return;
    // Switch straight to the first newly imported phrase, so adding it
    // shows up on the paper immediately as confirmation it worked.
    const newIndex = phrases.length;
    setPhrases((prev) => [
      ...prev,
      ...texts.map((text) => ({ text, favorite: false })),
    ]);
    setLibrary((prev) => ({ ...prev, currentIndex: newIndex }));
  }

  function editPhrase(index: number, text: string) {
    setPhrases((prev) =>
      prev.map((phrase, i) => (i === index ? { ...phrase, text } : phrase)),
    );
  }

  function deletePhrase(index: number) {
    if (phrases.length <= 1) return;
    setPhrases((prev) => prev.filter((_, i) => i !== index));
    setLibrary((prev) => {
      if (prev.currentIndex === index) return { ...prev, currentIndex: 0 };
      if (prev.currentIndex > index) {
        return { ...prev, currentIndex: prev.currentIndex - 1 };
      }
      return prev;
    });
  }

  function toggleFavorite(index: number) {
    setPhrases((prev) =>
      prev.map((phrase, i) =>
        i === index ? { ...phrase, favorite: !phrase.favorite } : phrase,
      ),
    );
  }

  const paper = (
    <div
      className={`paper paper--${settings.paperStyle}`}
      ref={paperRef}
      style={{ padding: `${settings.padding * PADDING_UNIT_PX}px` }}
    >
      <div
        className="paper__backdrop"
        style={{ opacity: settings.paperOpacity / 100 }}
      />

      <CalligraphyText
        text={phrases[library.currentIndex].text}
        {...settings}
      />

      {/* Anchored to the paper's own corner, so it always tracks the card
          instead of floating over the window at large. */}
      {movable && (
        <SettingsButton
          active={settingsOpen}
          onClick={() => {
            if (settingsOpen) {
              setSettingsOpen(false);
            } else {
              void openSettings();
            }
          }}
        />
      )}
    </div>
  );

  const settingsPanel = movable && settingsOpen && (
    <SettingsPanel
      settings={settings}
      onChange={updateSettings}
      libraryMode={library.mode}
      libraryIntervalSeconds={library.intervalSeconds}
      onLibraryModeChange={setLibraryMode}
      onLibraryIntervalChange={setLibraryInterval}
      windowBehavior={windowBehavior}
      onWindowBehaviorChange={updateWindowBehavior}
      onClose={() => setSettingsOpen(false)}
    />
  );

  // Paper plus, when open, the library popup directly below it — grouped
  // so the pair sits together as one column inside .composition regardless
  // of which side the settings panel is on. The popup mirrors settingsOpen
  // exactly (no button of its own) — it opens and closes together with the
  // settings panel.
  const paperColumn = (
    <div className="paper-column">
      {paper}
      {movable && settingsOpen && (
        <LibraryPopup
          phrases={phrases}
          currentIndex={library.currentIndex}
          width={paperWidth}
          onSelect={selectPhrase}
          onImportMany={importPhrases}
          onEdit={editPhrase}
          onDelete={deletePhrase}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );

  return (
    <div
      className={`stage${movable ? " movable" : ""}`}
      onDoubleClick={toggleMovable}
      onMouseDown={() => {
        if (movable) {
          appWindow.startDragging();
        }
      }}
    >
      {/* The settings panel sits beside the paper column, not on top of
          it, so opening it never covers the calligraphy or moves the
          paper — its side (left/right) is decided in openSettings()
          above. The library popup sits below the paper within
          paperColumn and opens/closes together with the settings panel,
          so it never disturbs the settings panel's layout either. */}
      <div className="composition" ref={compositionRef}>
        {panelSide === "left" ? settingsPanel : null}
        {paperColumn}
        {panelSide === "right" ? settingsPanel : null}
      </div>
    </div>
  );
}

export default App;

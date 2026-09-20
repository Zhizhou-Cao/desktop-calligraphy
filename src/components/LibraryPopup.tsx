import { useState } from "react";
import type { PhraseEntry } from "../types/phrase";
import "./LibraryPopup.css";

interface LibraryPopupProps {
  phrases: PhraseEntry[];
  currentIndex: number;
  // Matches the paper's current rendered width (measured in App.tsx) —
  // undefined only for the brief instant before the first measurement.
  width: number | undefined;
  onSelect: (index: number) => void;
  onImportMany: (texts: string[]) => void;
  onEdit: (index: number, text: string) => void;
  onDelete: (index: number) => void;
  onToggleFavorite: (index: number) => void;
  onClose: () => void;
}

// Compact single-line preview: the phrase's own "\n" is just a layout hint
// for lineBreak, not meaningful here.
function previewLine(phrase: string): string {
  return phrase.replace(/\n/g, "");
}

// Splits a bulk-import draft on "#" into individual phrases, trimming
// blanks — lets one paste add several entries at once.
function splitDraft(draft: string): string[] {
  return draft
    .split("#")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

// Sits below the paper (a sibling in .paper-column, see App.tsx/App.css),
// to the left of the settings panel, matching the paper's own width.
// Every handler stops propagation for the same reason as SettingsPanel:
// interacting with it must never trigger the window drag / lock-toggle
// logic on .stage behind it.
export function LibraryPopup({
  phrases,
  currentIndex,
  width,
  onSelect,
  onImportMany,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClose,
}: LibraryPopupProps) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  function handleImport() {
    const parts = splitDraft(draft);
    if (parts.length === 0) return;
    onImportMany(parts);
    setDraft("");
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditDraft(phrases[index].text);
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const text = editDraft.trim();
    if (text) onEdit(editingIndex, text);
    setEditingIndex(null);
  }

  return (
    <div
      className="library-popup"
      style={width ? { width } : undefined}
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="library-popup__header">
        <span className="library-popup__title">文本库</span>
        <button
          type="button"
          className="library-popup__close"
          aria-label="关闭文本库"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="library-popup__list">
        {phrases.map((phrase, index) =>
          editingIndex === index ? (
            <div className="library-popup__edit" key={index}>
              <textarea
                className="library-popup__textarea"
                value={editDraft}
                onChange={(event) => setEditDraft(event.target.value)}
                autoFocus
              />
              <div className="library-popup__edit-actions">
                <button type="button" onClick={saveEdit}>
                  保存
                </button>
                <button type="button" onClick={() => setEditingIndex(null)}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="library-popup__row" key={index}>
              <button
                type="button"
                className={`library-popup__item${
                  index === currentIndex ? " is-active" : ""
                }`}
                onClick={() => onSelect(index)}
              >
                {previewLine(phrase.text)}
              </button>
              <button
                type="button"
                className={`library-popup__icon-button${
                  phrase.favorite ? " is-favorite" : ""
                }`}
                aria-label={phrase.favorite ? "取消收藏" : "收藏"}
                onClick={() => onToggleFavorite(index)}
              >
                {phrase.favorite ? "★" : "☆"}
              </button>
              <button
                type="button"
                className="library-popup__icon-button"
                aria-label="编辑"
                onClick={() => startEdit(index)}
              >
                ✎
              </button>
              <button
                type="button"
                className="library-popup__icon-button"
                aria-label="删除"
                disabled={phrases.length <= 1}
                onClick={() => onDelete(index)}
              >
                ×
              </button>
            </div>
          ),
        )}
      </div>

      <div className="library-popup__import">
        <textarea
          className="library-popup__textarea"
          placeholder="输入新短句，换行处会成为分行位置；多条用 # 分隔可一次导入"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="button"
          className="library-popup__add"
          disabled={splitDraft(draft).length === 0}
          onClick={handleImport}
        >
          添加
        </button>
      </div>
    </div>
  );
}

export default LibraryPopup;

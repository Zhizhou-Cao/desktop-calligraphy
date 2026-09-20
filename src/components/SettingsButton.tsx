import "./SettingsButton.css";

interface SettingsButtonProps {
  active: boolean;
  onClick: () => void;
}

// Stops propagation on every native interaction so clicking the button
// never bubbles up into the window's drag-lock handlers on .stage.
export function SettingsButton({ active, onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      className={`settings-button${active ? " is-active" : ""}`}
      aria-label="设置"
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.94-2.47c.04-.34.06-.68.06-1.03s-.02-.69-.06-1.03l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.6 7.6 0 0 0-1.78-1.03l-.36-2.54a.5.5 0 0 0-.5-.43h-3.84a.5.5 0 0 0-.5.43l-.36 2.54c-.65.25-1.25.6-1.78 1.03l-2.39-.96a.5.5 0 0 0-.6.22L1.15 8.75a.5.5 0 0 0 .12.64l2.03 1.58c-.04.34-.06.68-.06 1.03s.02.69.06 1.03L1.27 14.6a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.53.43 1.13.78 1.78 1.03l.36 2.54c.05.25.26.43.5.43h3.84c.24 0 .45-.18.5-.43l.36-2.54c.65-.25 1.25-.6 1.78-1.03l2.39.96c.22.09.48 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58Z"
        />
      </svg>
    </button>
  );
}

export default SettingsButton;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Resizes and repositions the window in one command instead of two
// separate JS-side calls. Driving both from a single Rust call keeps them
// on the same native event-loop turn, avoiding the brief visible jump that
// showed up when the size change and the follow-up position correction
// were dispatched as two round trips from the frontend.
#[tauri::command]
fn resize_and_reposition(
    window: tauri::WebviewWindow,
    width: f64,
    height: f64,
    x: i32,
    y: i32,
) -> Result<(), String> {
    window
        .set_size(tauri::LogicalSize::new(width, height))
        .map_err(|e| e.to_string())?;
    window
        .set_position(tauri::PhysicalPosition::new(x, y))
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Marks the window as belonging to every macOS Space (virtual desktop),
// not just the one it was created on — the desktop ornament should stay
// visible no matter which Space you switch to. Tauri's cross-platform
// window API has no equivalent for this, so it's set directly on the
// underlying NSWindow. "Stationary" alongside it keeps the window from
// getting swept into Mission Control's window-shuffle animation.
#[cfg(target_os = "macos")]
fn enable_all_spaces(window: &tauri::WebviewWindow) {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};
    use std::ptr::NonNull;

    let Ok(raw) = window.ns_window() else { return };
    let Some(non_null) = NonNull::new(raw) else { return };
    let ns_window: &NSWindow = unsafe { non_null.cast().as_ref() };
    ns_window.setCollectionBehavior(
        NSWindowCollectionBehavior::CanJoinAllSpaces
            | NSWindowCollectionBehavior::Stationary,
    );
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, resize_and_reposition])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    enable_all_spaces(&window);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

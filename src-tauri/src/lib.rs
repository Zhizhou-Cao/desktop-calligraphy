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

// Controls whether the window belongs to every macOS Space (virtual
// desktop) or just whichever one it's currently on — the "仅在此页" setting.
// Tauri's cross-platform window API has no equivalent for this, so it's set
// directly on the underlying NSWindow. "Stationary" alongside
// CanJoinAllSpaces keeps the window from getting swept into Mission
// Control's window-shuffle animation; with all-Spaces off, the window just
// gets macOS's ordinary single-Space behavior instead.
#[cfg(target_os = "macos")]
fn apply_all_spaces(window: &tauri::WebviewWindow, enabled: bool) {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};
    use std::ptr::NonNull;

    let Ok(raw) = window.ns_window() else { return };
    let Some(non_null) = NonNull::new(raw) else { return };
    let ns_window: &NSWindow = unsafe { non_null.cast().as_ref() };
    let behavior = if enabled {
        NSWindowCollectionBehavior::CanJoinAllSpaces | NSWindowCollectionBehavior::Stationary
    } else {
        NSWindowCollectionBehavior::empty()
    };
    ns_window.setCollectionBehavior(behavior);
}

// Runtime toggle for "仅在此页", called from the settings panel. A no-op on
// non-macOS targets, same as the rest of this file's macOS-only behavior.
#[tauri::command]
fn set_all_spaces(window: tauri::WebviewWindow, enabled: bool) {
    #[cfg(target_os = "macos")]
    apply_all_spaces(&window, enabled);
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (window, enabled);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            resize_and_reposition,
            set_all_spaces
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    apply_all_spaces(&window, true);
                }
            }

            // A trimmed-down menu bar: this is a single-purpose ornament, not
            // a document-based app, so the default File/Edit/View/Window
            // menus Tauri would otherwise generate are all dead weight (no
            // text fields, no multi-window semantics). "设置" reproduces
            // exactly what clicking the on-canvas settings gear does —
            // unlocking the canvas if needed and opening the settings panel
            // — via a plain app event the frontend already listens for.
            use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
            let settings_item =
                MenuItem::with_id(app, "toggle-settings", "设置", true, None::<&str>)?;
            let quit_item = PredefinedMenuItem::quit(app, Some("退出"))?;
            let app_submenu = Submenu::with_items(
                app,
                "desktop-calligraphy",
                true,
                &[&settings_item, &quit_item],
            )?;
            let menu = Menu::with_items(app, &[&app_submenu])?;
            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle, event| {
                if event.id() == "toggle-settings" {
                    use tauri::Emitter;
                    let _ = app_handle.emit("toggle-settings", ());
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::os::windows::process::CommandExt;
use std::process::Command;
use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter,
    Manager,
};

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize, Clone)]
pub struct DnsInfo {
    interface_name: String,
    servers: Vec<String>,
    is_automatic: bool,
}

#[derive(Serialize, Clone)]
pub struct CommandResult {
    success: bool,
    message: String,
}

/// Payload emitted to frontend when DNS changes from tray
#[derive(Serialize, Clone)]
struct DnsChangedPayload {
    success: bool,
    message: String,
}

/// Helper function to execute DNS command on a specific interface
fn try_set_dns(interface: &str, primary: &str, secondary: &str) -> std::io::Result<bool> {
    let output = Command::new("netsh")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&[
            "interface", "ipv4", "set", "dnsservers",
            interface, "static", primary, "primary", "validate=no",
        ])
        .output()?;

    if !output.status.success() {
        return Ok(false);
    }

    if !secondary.is_empty() {
        let _ = Command::new("netsh")
            .creation_flags(CREATE_NO_WINDOW)
            .args(&[
                "interface", "ipv4", "add", "dnsservers",
                interface, secondary, "index=2", "validate=no",
            ])
            .output();
    }

    Ok(true)
}

fn is_valid_ip(s: &str) -> bool {
    let parts: Vec<&str> = s.split('.').collect();
    if parts.len() != 4 { return false; }
    parts.iter().all(|part| part.parse::<u8>().is_ok())
}

/// Helper function to find the REAL connected interface
fn get_connected_interface_name() -> Result<String, String> {
    let output = Command::new("netsh")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&["interface", "show", "interface"])
        .output()
        .map_err(|e| format!("netsh hatasi: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut connected_interfaces = Vec::new();

    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() { continue; }
        let lower = line.to_lowercase();
        if lower.contains("connected") || lower.contains("bağlı") || lower.contains("bagli") {
            if lower.contains("ethernet") {
                connected_interfaces.push("Ethernet".to_string());
            } else if lower.contains("wi-fi") || lower.contains("wifi") {
                connected_interfaces.push("Wi-Fi".to_string());
            } else {
                let parts: Vec<&str> = line.split("  ").filter(|s| !s.trim().is_empty()).collect();
                if let Some(last) = parts.last() {
                    connected_interfaces.push(last.trim().to_string());
                }
            }
        }
    }

    if connected_interfaces.is_empty() {
        return Err("Aktif bir ağ bağlantısı bulunamadı.".to_string());
    }

    if connected_interfaces.contains(&"Ethernet".to_string()) {
        return Ok("Ethernet".to_string());
    }
    Ok(connected_interfaces[0].clone())
}

/// Get DNS from ipconfig for SPECIFIC interface
fn get_dns_from_ipconfig(interface_name: &str) -> Result<Vec<String>, String> {
    let output = Command::new("ipconfig")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&["/all"])
        .output()
        .map_err(|e| format!("ipconfig hatasi: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut servers = Vec::new();
    let mut in_target = false;
    let mut in_dns = false;

    for line in stdout.lines() {
        let trimmed = line.trim();
        let lower_line = line.to_lowercase();

        if !line.starts_with(' ') && lower_line.contains(&interface_name.to_lowercase()) {
            in_target = true;
            continue;
        }

        // Did we move to a different adapter section?
        if in_target && !line.starts_with(' ') && !trimmed.is_empty() {
            if !lower_line.contains(&interface_name.to_lowercase()) {
                if !servers.is_empty() { break; }
                in_target = false;
            }
        }

        if in_target {
            if trimmed.to_lowercase().contains("dns") && trimmed.contains(':') {
                in_dns = true;
                if let Some(ip) = trimmed.split(':').last() {
                    let ip = ip.trim();
                    if is_valid_ip(ip) { servers.push(ip.to_string()); }
                }
            } else if in_dns && is_valid_ip(trimmed) {
                servers.push(trimmed.to_string());
            } else if in_dns && !trimmed.is_empty() && !is_valid_ip(trimmed) {
                in_dns = false;
            }
        }
    }
    Ok(servers)
}

// Global implementors using SMART interface detection
fn set_dns_impl(primary: &str, secondary: &str) -> std::io::Result<bool> {
    let interface_name = match get_connected_interface_name() {
        Ok(name) => name,
        Err(_) => return Ok(false),
    };
    try_set_dns(&interface_name, primary, secondary)
}

fn reset_dns_impl() -> std::io::Result<bool> {
    let interface_name = match get_connected_interface_name() {
        Ok(name) => name,
        Err(_) => return Ok(false),
    };

    let output = Command::new("netsh")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&["interface", "ipv4", "set", "dnsservers", &interface_name, "source=dhcp"])
        .output()?;

    let _ = Command::new("netsh")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&["interface", "ipv4", "delete", "dnsservers", &interface_name, "all"])
        .output();

    let _ = Command::new("ipconfig")
        .creation_flags(CREATE_NO_WINDOW)
        .arg("/flushdns")
        .output();

    Ok(output.status.success())
}

#[tauri::command]
fn set_dns(primary: String, secondary: String) -> Result<CommandResult, String> {
    if !is_valid_ip(&primary) {
        return Ok(CommandResult { success: false, message: "Geçersiz IP".to_string() });
    }
    match set_dns_impl(&primary, &secondary) {
        Ok(true) => Ok(CommandResult { success: true, message: "DNS Uygulandı".to_string() }),
        _ => Ok(CommandResult { success: false, message: "Hata: Yönetici Yetkisi?".to_string() }),
    }
}

#[tauri::command]
fn reset_dns() -> Result<CommandResult, String> {
    match reset_dns_impl() {
        Ok(true) => Ok(CommandResult { success: true, message: "Varsayılana dönüldü".to_string() }),
        _ => Ok(CommandResult { success: false, message: "Hata".to_string() }),
    }
}

#[tauri::command]
fn get_current_dns() -> Result<DnsInfo, String> {
    let interface_name = get_connected_interface_name().unwrap_or_else(|_| "Bilinmiyor".to_string());

    if interface_name == "Bilinmiyor" {
        return Ok(DnsInfo { interface_name, servers: vec![], is_automatic: true });
    }

    let servers = get_dns_from_ipconfig(&interface_name).unwrap_or_default();
    let is_automatic = servers.is_empty();

    Ok(DnsInfo { interface_name, servers, is_automatic })
}

#[tauri::command]
async fn check_admin() -> bool {
    let output = Command::new("powershell")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&[
            "-NoProfile",
            "-Command",
            "([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"
        ])
        .output();

    match output {
        Ok(out) => {
            let result = String::from_utf8_lossy(&out.stdout).trim().to_lowercase();
            result.starts_with("true")
        },
        Err(_) => false,
    }
}

/// Helper: apply DNS from tray and emit result to frontend
fn tray_set_dns(app: &tauri::AppHandle, primary: &str, secondary: &str, name: &str) {
    let success = matches!(set_dns_impl(primary, secondary), Ok(true));
    let message = if success {
        format!("{} başarıyla uygulandı!", name)
    } else {
        format!("{} uygulanamadı! Yönetici olarak çalıştırın.", name)
    };
    let _ = app.emit("dns-changed", DnsChangedPayload { success, message });
}

fn tray_reset_dns(app: &tauri::AppHandle) {
    let success = matches!(reset_dns_impl(), Ok(true));
    let message = if success {
        "Sistem varsayılanına dönüldü!".to_string()
    } else {
        "Sıfırlama başarısız! Yönetici olarak çalıştırın.".to_string()
    };
    let _ = app.emit("dns-changed", DnsChangedPayload { success, message });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "Pencereyi Göster", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;
            let sep1 = tauri::menu::PredefinedMenuItem::separator(app)?;
            let sep2 = tauri::menu::PredefinedMenuItem::separator(app)?;

            let i_cloud = MenuItem::with_id(app, "cat_cloudflare", "☁ Cloudflare (1.1.1.1)", true, None::<&str>)?;
            let i_google = MenuItem::with_id(app, "cat_google", "🔷 Google DNS (8.8.8.8)", true, None::<&str>)?;
            let i_quad9 = MenuItem::with_id(app, "cat_quad9", "🛡 Quad9 (9.9.9.9)", true, None::<&str>)?;
            let i_open = MenuItem::with_id(app, "cat_open", "🔶 OpenDNS (208.67.222.222)", true, None::<&str>)?;
            let i_reset = MenuItem::with_id(app, "cat_reset", "🔄 Sistem Varsayılanı (DHCP)", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[
                &show_i,
                &sep1,
                &i_cloud, &i_google, &i_quad9, &i_open, &i_reset,
                &sep2,
                &quit_i
            ])?;

            let _tray = TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "cat_cloudflare" => tray_set_dns(app, "1.1.1.1", "1.0.0.1", "Cloudflare"),
                    "cat_google" => tray_set_dns(app, "8.8.8.8", "8.8.4.4", "Google DNS"),
                    "cat_quad9" => tray_set_dns(app, "9.9.9.9", "149.112.112.112", "Quad9"),
                    "cat_open" => tray_set_dns(app, "208.67.222.222", "208.67.220.220", "OpenDNS"),
                    "cat_reset" => tray_reset_dns(app),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![get_current_dns, set_dns, reset_dns, check_admin])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(any(dev, debug_assertions))]
pub mod dev_protocol_endpoint;
#[cfg(desktop)]
pub mod download_dispatch;
pub mod tauri_resource_adapter;

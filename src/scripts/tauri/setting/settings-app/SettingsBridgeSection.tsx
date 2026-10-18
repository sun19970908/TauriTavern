import { useState } from 'react';

import { SettingRow, SettingsSection } from './SettingsComponents';

const BRIDGE_BASE_URL_KEY = 'ttPluginBridge.baseUrl';
const BRIDGE_AUTH_KEY = 'ttPluginBridge.auth';
const DEFAULT_BRIDGE_BASE_URL = 'http://127.0.0.1:8000';

// Copy is inlined rather than added to the locale files: this is a local-only
// section, and every merged-to-zh-cn.json key is a merge conflict when upstream
// touches the same file.
const TITLE = '服务端插件桥';
const HOST_URL_LABEL = '桥接宿主地址';
const HOST_URL_HINT = '留空 = 使用默认地址 http://127.0.0.1:8000。配置仅保存在本设备。';
const CREDENTIALS_LABEL = '桥接认证凭据';
const CREDENTIALS_HINT = '与 SillyTavern config.yaml 的 basicAuthUser 一致（user:password），留空则不注入。仅保存在本设备。';

function readBridgeSetting(key: string): string {
    try {
        return window.localStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
}

function writeBridgeSetting(key: string, value: string): void {
    try {
        if (value) {
            window.localStorage.setItem(key, value);
        } else {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Storage unavailable: the bridge route treats unreadable config as disabled.
    }
}

/**
 * The "Server Plugin Bridge" section. Bridge settings intentionally live in
 * localStorage: the host address is a per-device deployment fact while
 * tauritavern-settings.json is synced verbatim between devices, so these
 * controls commit immediately instead of joining the draft/save flow (the
 * same immediate-commit pattern as the data root). An empty host field means
 * the default host; credentials follow SillyTavern's basicAuthUser value.
 */
export function SettingsBridgeSection() {
    const [baseUrl, setBaseUrl] = useState(
        () => readBridgeSetting(BRIDGE_BASE_URL_KEY) || DEFAULT_BRIDGE_BASE_URL,
    );
    const [credentials, setCredentials] = useState(() => readBridgeSetting(BRIDGE_AUTH_KEY));

    return (
        <SettingsSection title={TITLE} icon="fa-plug">
            <SettingRow label={HOST_URL_LABEL} hint={HOST_URL_HINT}>
                <input
                    type="text"
                    className="text_pole tt-settings-input"
                    value={baseUrl}
                    placeholder={DEFAULT_BRIDGE_BASE_URL}
                    spellCheck={false}
                    onChange={event => {
                        const value = event.target.value;
                        setBaseUrl(value);
                        writeBridgeSetting(BRIDGE_BASE_URL_KEY, value);
                    }}
                />
            </SettingRow>
            <SettingRow label={CREDENTIALS_LABEL} hint={CREDENTIALS_HINT}>
                <input
                    type="password"
                    className="text_pole tt-settings-input"
                    value={credentials}
                    placeholder="user:password"
                    autoComplete="off"
                    onChange={event => {
                        const value = event.target.value;
                        setCredentials(value);
                        writeBridgeSetting(BRIDGE_AUTH_KEY, value);
                    }}
                />
            </SettingRow>
        </SettingsSection>
    );
}

## Chex Desktop: Build and Distribution

### Dependencies and versions
- Node: >=22
- pnpm: 10.19.0
- Rust: stable toolchain (2021 edition)
- Tauri CLI: ^2.9.2
- Vite: ^7.1.12
- TypeScript: ~5.8.3

Frontend env (non-secret):
- VITE_BYOM_BASE_URL
- VITE_BYOM_MODEL

Runtime secrets (staging only):
- CHEX_BYOM_API_KEY

### macOS
Codesign and notarization require Apple Developer ID credentials.

Build (staging):
```
pnpm -C apps/desktop tauri build --config ./src-tauri/tauri.conf.staging.json
```

Build (stable):
```
pnpm -C apps/desktop tauri build --config ./src-tauri/tauri.conf.stable.json
```

Required environment variables (example):
```
APPLE_ID=<apple id>
APPLE_ID_PASSWORD=<app-specific-password>
APPLE_TEAM_ID=<team id>
APPLE_CERTIFICATE=<base64 p12>
APPLE_CERTIFICATE_PASSWORD=<password>
TAURI_SIGNING_PRIVATE_KEY=<key>
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<password>
CHEX_BYOM_API_KEY=<secret>         # staging only
VITE_BYOM_BASE_URL=https://staging.litellm.us-west-2.cicerotech.link/
VITE_BYOM_MODEL=azure-gpt-4.1-2025-04-14
```

Artifacts:
- apps/desktop/src-tauri/target/*/release/bundle/dmg/*.dmg

### Windows
Build:
```
pnpm -C apps/desktop tauri build --target x86_64-pc-windows-msvc --config ./src-tauri/tauri.conf.staging.json
```

Environment variables:
```
CHEX_BYOM_API_KEY=<secret>         # staging only
VITE_BYOM_BASE_URL=https://staging.litellm.us-west-2.cicerotech.link/
VITE_BYOM_MODEL=azure-gpt-4.1-2025-04-14
```

Artifacts:
- apps/desktop/src-tauri/target/**/bundle/msi/*.msi
- apps/desktop/src-tauri/target/**/bundle/nsis/*.exe

### CI
Workflow: .github/workflows/desktop_cd.yaml
- Injects secrets and builds DMG/MSI/NSIS

### Behavior defaults
- Telemetry disabled by default
- Guest mode onboarding
- BYOM base URL and model pre-seeded
- BYOM API key stored in OS keychain on first run


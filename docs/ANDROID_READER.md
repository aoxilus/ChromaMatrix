# Android reader contract

## Capture profile

The Android reader targets Android 12 and newer phones. It captures through the
same browser decoder used by the desktop app, preserving one protocol
implementation instead of maintaining a second native decoder.

Recommended capture conditions:

- `PALETTE_8` for handheld photos.
- At least 8–12 source pixels per dot.
- Diffuse light, no flash reflection, and a steady focus lock.
- Keep the complete four-corner frame in view.

## Color contract

The default encoder mode is now `PALETTE_8`. Its eight colors have larger
perceptual separation than the denser palettes, which reduces confusion after
camera white balance, JPEG compression, and paper lighting changes.

The decoder remains backward-compatible with the existing palette IDs:

- `1`: `PALETTE_8`
- `2`: `PALETTE_16`
- `3`: `PALETTE_64`
- `4`: `ASCII_95`
- `5`: `PALETTE_256`

This is a reliability-default change, not a destructive format migration.
Previously generated matrices continue to advertise and decode their own mode.

## Android packaging

`android/` packages the local web app into a WebView using
`WebViewAssetLoader`. It does not embed an eSAIL URL or put production URLs
inside the binary format.

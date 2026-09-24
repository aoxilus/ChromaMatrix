# ChromaMatrix Reader for Android

This is a functional Android wrapper around the real ChromaMatrix web encoder
and decoder. The Gradle build copies `index.html` and `src/` into the APK, so
the decoder remains local and does not depend on eSAIL production.

## Device target

- Android 12+ (`minSdk 31`), covering modern phones from roughly the last five
  years.
- Target/compile SDK 35.
- Camera permission is requested only when the reader starts.
- Camera capture uses the existing web reader through a secure
  `WebViewAssetLoader` origin; upload, paste, decode, and camera paths share
  the same implementation.

## Build

Open this `android/` directory in Android Studio and let it sync the Gradle
project. The build task `syncChromaMatrixWeb` packages the current local web
app before `preBuild`.

The phone-safe contract defaults to `PALETTE_8`: eight high-separation colors
are slower than 256 colors but much more reliable in a handheld photo. Existing
PALETTE_16/64/ASCII-95/256 matrices remain supported by the decoder.

Made with 🥑 by [aoxilus](https://github.com/aoxilus)

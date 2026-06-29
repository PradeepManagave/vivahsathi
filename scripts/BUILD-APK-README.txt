M-Plus Matrimony - Android APK Build Script
============================================

Prerequisites:
  1. Node.js >= 20.0.0 (LTS recommended)
  2. Java JDK 17+
  3. Android Studio with Android SDK (API 34+)
  4. ANDROID_HOME environment variable set to SDK path
  5. A deployed instance of the M-Plus web app (or run locally)

Usage:
  .\scripts\build-apks.ps1 [-Flavor <user|admin|centre|vendor>] [-BuildType <debug|release>]

Examples:
  .\scripts\build-apks.ps1 -Flavor user          # Build user debug APK
  .\scripts\build-apks.ps1 -Flavor admin -BuildType release   # Build admin release AAB
  .\scripts\build-apks.ps1 -Flavor all            # Build all 4 flavors (debug)

For release builds, set environment variables:
  $env:KEYSTORE_PATH = "C:\path\to\keystore.jks"
  $env:KEYSTORE_PASSWORD = "password"
  $env:KEYSTORE_ALIAS = "alias"
  $env:KEYSTORE_ALIAS_PASSWORD = "alias-password"


#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Builds M-Plus Matrimony Android APK(s) for specified flavor(s).
.DESCRIPTION
  Builds one or all of the 4 app flavors: user, admin, centre, vendor.
  Each flavor maps to a different appId, appName, and base URL.
.PARAMETER Flavor
  App flavor to build: user, admin, centre, vendor, or "all".
.PARAMETER BuildType
  Build type: debug (default) or release.
.EXAMPLE
  .\scripts\build-apks.ps1 -Flavor user -BuildType debug
#>

param(
  [ValidateSet('user', 'admin', 'centre', 'vendor', 'all')]
  [string]$Flavor = 'user',

  [ValidateSet('debug', 'release')]
  [string]$BuildType = 'debug'
)

$ROOT = Split-Path -Parent $PSScriptRoot
$FRONTEND = Join-Path $ROOT "frontend"
$CAPACITOR_DIR = Join-Path $FRONTEND "android"

# ---------- Prerequisites ----------
function Test-Prerequisites {
  $ok = $true

  $nodeVer = node --version 2>$null
  if (-not $nodeVer) {
    Write-Error "Node.js not found. Install Node.js >= 20.0.0"
    $ok = $false
  } elseif ($nodeVer -match 'v(\d+)') {
    $major = [int]$Matches[1]
    if ($major -lt 20) {
      Write-Error "Node.js $nodeVer detected. Need >= 20.0.0"
      $ok = $false
    }
  }

  $javaVer = java -version 2>&1
  if (-not $javaVer) {
    Write-Error "Java JDK not found. Install JDK 17+"
    $ok = $false
  }

  $androidHome = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
  if (-not $androidHome) {
    $androidHome = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Machine')
  }
  if (-not $androidHome -or -not (Test-Path $androidHome)) {
    Write-Warning "ANDROID_HOME not set or invalid. Set it to your Android SDK path."
    Write-Warning "Build may fail if ANDROID_HOME is missing."
  }

  if (-not $ok) {
    exit 1
  }
}

# ---------- Install Capacitor ----------
function Install-CapacitorDeps {
  Push-Location $FRONTEND
  try {
    $deps = @('@capacitor/core', '@capacitor/cli', '@capacitor/android')
    $missing = @()
    $nmDir = Join-Path $FRONTEND "node_modules"
    foreach ($dep in $deps) {
      $dir = Join-Path $nmDir ($dep -replace '/', '\')
      if (-not (Test-Path -LiteralPath $dir)) {
        $missing += $dep
      }
    }

    if ($missing.Count -gt 0) {
      Write-Host "Installing missing deps: $($missing -join ', ')"
      npm install --save $missing 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
      }
    } else {
      Write-Host "All Capacitor deps found."
    }
  } finally {
    Pop-Location
  }
}

# ---------- Build Web App ----------
function Build-WebApp {
  Push-Location $FRONTEND
  try {
    Write-Host "Building Next.js web app..."
    npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "next build failed"
    }
    Write-Host "Web app built successfully."
  } finally {
    Pop-Location
  }
}

# ---------- Sync Capacitor ----------
function Sync-Capacitor {
  Push-Location $FRONTEND
  try {
    Write-Host "Syncing Capacitor with flavor: $($args[0])"
    $env:FLAVOR = $args[0]
    npx cap sync android 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "cap sync failed"
    }
    Write-Host "Capacitor synced."
  } finally {
    Pop-Location
    Remove-Item Env:\FLAVOR -ErrorAction SilentlyContinue
  }
}

# ---------- Build APK ----------
function Build-AndroidApk {
  param([string]$FlavorName, [string]$BuildType)

  Write-Host "========================================"
  Write-Host "Building $FlavorName APK ($BuildType)"
  Write-Host "========================================"

  # Add Android platform if not exists
  Push-Location $FRONTEND
  try {
    if (-not (Test-Path $CAPACITOR_DIR)) {
      Write-Host "Adding Android platform..."
      npx cap add android 2>&1
      if ($LASTEXITCODE -ne 0) {
        throw "cap add android failed"
      }
    }
  } finally {
    Pop-Location
  }

  Sync-Capacitor $FlavorName

  Push-Location $CAPACITOR_DIR
  try {
    if ($BuildType -eq 'release') {
      .\gradlew.bat assembleRelease 2>&1
      $apkPattern = "app\build\outputs\apk\release\*.apk"
      $aabPattern = "app\build\outputs\bundle\release\*.aab"
    } else {
      .\gradlew.bat assembleDebug 2>&1
      $apkPattern = "app\build\outputs\apk\debug\*.apk"
    }

    if ($LASTEXITCODE -ne 0) {
      throw "Gradle build failed for $FlavorName ($BuildType)"
    }

    # Find output files
    $outputs = Get-ChildItem -Path $CAPACITOR_DIR -Filter $apkPattern -Recurse -ErrorAction SilentlyContinue
    if ($outputs.Count -gt 0) {
      $outDir = Join-Path $ROOT "builds\android"
      New-Item -ItemType Directory -Path $outDir -Force | Out-Null
      foreach ($f in $outputs) {
        $dest = Join-Path $outDir "$FlavorName-$($f.Name)"
        Copy-Item -Path $f.FullName -Destination $dest -Force
        Write-Host "APK: $dest"
      }
    } else {
      Write-Warning "No APK output found for $FlavorName"
    }

    Write-Host "Build complete for $FlavorName ($BuildType)"
  } finally {
    Pop-Location
  }
}

# ---------- Main ----------
Write-Host @"

  _  ___  ___
 | \| \ \/ / | | | \ \ / / _ \ 
 | .  |>  <| |_| |  \ V /  __/ 
 |_|\_|/_/\_\\__,_|   \_/ \___|
 ================================
 M-Plus Matrimony APK Builder
 ================================

"@

Test-Prerequisites
Install-CapacitorDeps
Build-WebApp

$flavorsToBuild = if ($Flavor -eq 'all') { @('user', 'admin', 'centre', 'vendor') } else { @($Flavor) }

foreach ($f in $flavorsToBuild) {
  Build-AndroidApk -FlavorName $f -BuildType $BuildType
}

Write-Host @"

====================================
All builds complete!
APKs/AABs are in: $ROOT\builds\android\
====================================
"@

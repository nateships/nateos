#!/usr/bin/env bash
set -euo pipefail

# NateOS — extract Apple assets from local macOS for use in the portfolio.
# Run only on macOS dev machines. Output: public/apple/{icons,wallpapers,fonts}.
# Note: Apple copyrighted material. Accepted risk per design spec section 18.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/apple"
mkdir -p "$OUT/icons" "$OUT/wallpapers" "$OUT/fonts"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: must run on macOS." >&2
  exit 1
fi

echo "Extracting app icons from /System/Applications/..."
APPS=(Finder Safari Calendar Calculator Messages TextEdit Terminal Contacts Preview "System Preferences" "System Settings")
# Locate an .icns for an app by checking common locations + falling back to first .icns
# in the app's Resources dir.
locate_app_icns() {
  local app="$1"
  local candidates=(
    "/System/Applications/$app.app/Contents/Resources/AppIcon.icns"
    "/System/Library/CoreServices/$app.app/Contents/Resources/AppIcon.icns"
    "/System/Applications/Utilities/$app.app/Contents/Resources/AppIcon.icns"
    "/Applications/$app.app/Contents/Resources/AppIcon.icns"
    "/System/Cryptexes/App/System/Applications/$app.app/Contents/Resources/AppIcon.icns"
  )
  for c in "${candidates[@]}"; do
    if [[ -f "$c" ]]; then
      echo "$c"
      return 0
    fi
  done
  # Fallback: first .icns inside known Resources dirs (handles renamed icns like Finder.icns,
  # Terminal.icns, SystemSettings.icns).
  local resource_dirs=(
    "/System/Applications/$app.app/Contents/Resources"
    "/System/Library/CoreServices/$app.app/Contents/Resources"
    "/System/Applications/Utilities/$app.app/Contents/Resources"
    "/Applications/$app.app/Contents/Resources"
    "/System/Cryptexes/App/System/Applications/$app.app/Contents/Resources"
  )
  for d in "${resource_dirs[@]}"; do
    if [[ -d "$d" ]]; then
      local found
      found="$(find "$d" -maxdepth 1 -type f -name '*.icns' 2>/dev/null | head -n 1)"
      if [[ -n "$found" ]]; then
        echo "$found"
        return 0
      fi
    fi
  done
  return 1
}
for app in "${APPS[@]}"; do
  if src="$(locate_app_icns "$app")"; then
    name="$(echo "$app" | tr '[:upper:] ' '[:lower:]-').icns"
    cp "$src" "$OUT/icons/$name"
    base="${name%.icns}"
    sips -s format png "$src" --out "$OUT/icons/$base.png" --resampleHeightWidthMax 256 >/dev/null
    echo "  + $base"
  else
    echo "  ! missing: $app" >&2
  fi
done

echo "Extracting Finder + system file icons from CoreTypes.bundle..."
CORE="/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources"
for f in FinderIcon.icns GenericFolderIcon.icns GenericDocumentIcon.icns AlertCautionIcon.icns; do
  if [[ -f "$CORE/$f" ]]; then
    cp "$CORE/$f" "$OUT/icons/"
    base="${f%.icns}"
    sips -s format png "$CORE/$f" --out "$OUT/icons/$base.png" --resampleHeightWidthMax 256 >/dev/null
  fi
done

echo "Extracting wallpapers..."
# Note: real high-res wallpapers may live in hidden .wallpapers/ subdirs and
# get streamed on demand. Force overwrite so stale stubs get replaced after
# macOS downloads the full versions.
WPS=("/System/Library/Desktop Pictures" "/Library/Desktop Pictures")
for d in "${WPS[@]}"; do
  if [[ -d "$d" ]]; then
    find "$d" -type f \( -name "*.heic" -o -name "*.jpg" -o -name "*.png" \) -print0 \
      | xargs -0 -I {} cp -f {} "$OUT/wallpapers/" 2>/dev/null || true
  fi
done

echo "Rendering file-type icons via NSWorkspace..."
SWIFT_SRC="$(mktemp -t icon_for_type.XXXXXX.swift)"
cat > "$SWIFT_SRC" <<'SWIFT'
import AppKit
let args = CommandLine.arguments
guard args.count >= 3 else { exit(1) }
let type = args[1]
let outPath = args[2]
let icon = NSWorkspace.shared.icon(forFileType: type)
icon.size = NSSize(width: 256, height: 256)
guard let tiff = icon.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiff),
      let png = rep.representation(using: .png, properties: [:]) else { exit(2) }
try png.write(to: URL(fileURLWithPath: outPath))
SWIFT
for ext in pdf txt md docx; do
  swift "$SWIFT_SRC" "$ext" "$OUT/icons/file-$ext.png" >/dev/null 2>&1 \
    && echo "  + file-$ext" \
    || echo "  ! file-$ext (swift render failed)" >&2
done
rm -f "$SWIFT_SRC"

echo "Extracting SF fonts..."
for f in "SF-Pro.ttf" "SF-Pro-Text-Regular.otf" "SFNS.ttf" "SFNSMono.ttf"; do
  src="/System/Library/Fonts/$f"
  if [[ -f "$src" ]]; then
    cp "$src" "$OUT/fonts/"
  fi
done

echo "Done. $(find "$OUT" -type f | wc -l | tr -d ' ') files in $OUT"

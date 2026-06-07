#!/bin/zsh
set -euo pipefail

PACKAGE_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$PACKAGE_DIR/timeline.json"
TEMP_ROOT="${TMPDIR:-/tmp}/sanguo-opening-v10-$$"
FRAMES_DIR="$TEMP_ROOT/frames"
AUDIO_WAV="$TEMP_ROOT/original-score.wav"
FINAL_VIDEO="$PACKAGE_DIR/sanguo_opening_oppressive_game_v10.mp4"
PREVIEW="$PACKAGE_DIR/preview_sheet_v10.jpg"
MOTION_PREVIEW="$PACKAGE_DIR/exit_motion_sheet_v10.jpg"
ZIP_PATH="$PACKAGE_DIR/../sanguo_opening_video_package_v10.zip"

cleanup() {
  if [[ "${KEEP_TEMP:-0}" == "1" ]]; then
    printf 'Temporary files kept at %s\n' "$TEMP_ROOT"
  else
    rm -rf "$TEMP_ROOT"
  fi
}
trap cleanup EXIT

mkdir -p "$FRAMES_DIR"

if [[ -n "${PYTHON_BIN:-}" ]]; then
  PYTHON="$PYTHON_BIN"
elif [[ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3" ]]; then
  PYTHON="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
else
  PYTHON="python3"
fi

if [[ -n "${FFMPEG_BIN:-}" && -x "$FFMPEG_BIN" ]]; then
  FFMPEG="$FFMPEG_BIN"
elif command -v ffmpeg >/dev/null 2>&1; then
  FFMPEG="$(command -v ffmpeg)"
else
  FFMPEG="$HOME/.local/bin/ffmpeg"
fi

read CONFIG_DURATION CONFIG_FPS <<EOF
$("$PYTHON" - "$CONFIG" <<'PY'
import json
import sys
from pathlib import Path
config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
print(float(config["duration"]), int(config["fps"]))
PY
)
EOF

printf 'Rendering V10 frames, preview sheets, and original audio...\n'
"$PYTHON" "$PACKAGE_DIR/render_cg.py" \
  --config "$CONFIG" \
  --frames "$FRAMES_DIR" \
  --audio "$AUDIO_WAV" \
  --preview "$PREVIEW" \
  --motion-preview "$MOTION_PREVIEW"

printf 'Encoding H.264 MP4 with AAC audio...\n'
"$FFMPEG" \
  -hide_banner \
  -loglevel warning \
  -y \
  -framerate "$CONFIG_FPS" \
  -i "$FRAMES_DIR/frame_%05d.jpg" \
  -i "$AUDIO_WAV" \
  -map 0:v:0 \
  -map 1:a:0 \
  -c:v libx264 \
  -preset medium \
  -crf 18 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 160k \
  -movflags +faststart \
  -t "$CONFIG_DURATION" \
  "$FINAL_VIDEO"

printf 'Verifying media metadata...\n'
"$FFMPEG" -hide_banner -i "$FINAL_VIDEO" 2>&1 | sed -n '1,24p' || true

printf 'Packaging V10 deliverables...\n'
rm -f "$ZIP_PATH"
(
  cd "$PACKAGE_DIR/.."
  zip -qr "$(basename "$ZIP_PATH")" "$(basename "$PACKAGE_DIR")" -x '*/.DS_Store' '*/__pycache__/*'
)

printf 'Done: %s\n' "$FINAL_VIDEO"

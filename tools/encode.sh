#!/usr/bin/env bash
# Regenerates everything in public/media/ from the masters in assets/.
# Masters are never modified. assets/ is gitignored (too large); this script is
# the record of how the shipped derivatives were produced.
#
# Source note: assets/video (2).mp4 is the true 1920x1080 master.
# chasing-light-1440p.mp4 is an upscale of it and adds no real detail
# (SSIM 0.986 against the original) — do not encode from it.
# The 8K Real-ESRGAN pass IS worth encoding from: downscaling 8K -> 1080p acts as
# supersampling and measurably retains more detail at the same file size
# (SSIM-vs-halved 0.951 from ESRGAN vs 0.971 from the plain master).
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="assets/video (2).realesrgan.mkv"
STILL="assets/first-frame.png"
OUT="public/media"
mkdir -p "$OUT"

# g=6 / bf=0 is the whole point: the master carries ONE keyframe for all 121
# frames, so every scrub seek decodes from frame 0. Short GOP, no B-frames.
common=(-c:v libx264 -profile:v high -pix_fmt yuv420p -g 6 -keyint_min 6
        -sc_threshold 0 -bf 0 -preset slow -movflags +faststart -an)

echo "→ desktop 1080p"
ffmpeg -y -v error -i "$SRC" -vf "scale=1920:1080:flags=lanczos" -crf 22 "${common[@]}" "$OUT/chasing-light-1080.mp4"

echo "→ mobile 720p"
ffmpeg -y -v error -i "$SRC" -vf "scale=1280:720:flags=lanczos" -crf 21 "${common[@]}" "$OUT/chasing-light-720.mp4"

echo "→ poster (first frame, from the 4K still — sharper than any video frame)"
ffmpeg -y -v error -i "$STILL" -vf "scale=1920:-1:flags=lanczos" -q:v 88 "$OUT/poster.webp"

echo "→ hold frame (the video's REAL final frame, not last-frame.png)"
ffmpeg -y -v error -sseof -0.05 -i "$SRC" -vframes 1 -vf "scale=1920:-1:flags=lanczos" -q:v 90 "$OUT/hold.webp"

echo "→ social card"
ffmpeg -y -v error -i "$STILL" -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 "$OUT/og.jpg"

ls -la "$OUT"

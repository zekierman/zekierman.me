#!/usr/bin/env bash
# Regenerates everything in public/media/ from the masters in assets/.
# Masters are never modified. assets/ is gitignored (too large); this script is
# the record of how the shipped derivatives were produced.
#
# Source note: chasing-light-master.mp4 is the chosen take — 1920x1080 / 24fps /
# 121 frames / 5.04s, generated from start-frame-v3.png and last-frame.png.
# Chosen by eye from six takes; the rejected ones are kept alongside it as
# candidate-*.mp4. A sharper Veo take measured more real detail, but this one
# reads calmer, and the hero holds frames statically under scroll where hard
# speculars are harshest. Its softness pays twice — it compresses far better too.
# Note it is the shortest take at 121 frames: fewer frames spread over the same
# scroll distance, so if scrubbing reads steppy, shorten the hero rather than
# reaching for frame interpolation first.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="assets/chasing-light-master.mp4"
STILL="assets/start-frame-v3.png"
OUT="public/media"
mkdir -p "$OUT"

# g=6 / bf=0 is the whole point: the master carries ONE keyframe for the entire
# clip, so every scrub seek would decode from frame 0. Short GOP, no B-frames.
common=(-c:v libx264 -profile:v high -pix_fmt yuv420p -g 6 -keyint_min 6
        -sc_threshold 0 -bf 0 -preset slow -movflags +faststart -an)

# CRF picked by measurement. Against this master, 1080p encodes to:
#   crf 22 -> 5.6 MB (ssim .986)   crf 24 -> 4.4 MB (.983)
#   crf 26 -> 3.4 MB (.979)        crf 28 -> 2.7 MB (.975)
# crf 24 rather than the flattest point on the curve: with only 121 frames each
# one sits on screen longer under scrub, so per-frame quality earns more here,
# and 4.4 MB is still light. g=12 would shave more at the same quality, but it
# doubles the worst-case scrub seek — that is the site's core risk, so revisit
# only once the scrub has been measured in a foreground browser.
echo "→ desktop 1080p"
ffmpeg -y -v error -i "$SRC" -vf "scale=1920:1080:flags=lanczos" -crf 24 "${common[@]}" "$OUT/chasing-light-1080.mp4"

echo "→ mobile 720p"
ffmpeg -y -v error -i "$SRC" -vf "scale=1280:720:flags=lanczos" -crf 23 "${common[@]}" "$OUT/chasing-light-720.mp4"

echo "→ poster (first frame, from the 4K still — sharper than any video frame)"
ffmpeg -y -v error -i "$STILL" -vf "scale=1920:-1:flags=lanczos" -q:v 88 "$OUT/poster.webp"

echo "→ hold frame (the video's REAL final frame, not last-frame.png)"
ffmpeg -y -v error -sseof -0.05 -i "$SRC" -vframes 1 -vf "scale=1920:-1:flags=lanczos" -q:v 90 "$OUT/hold.webp"

echo "→ social card"
ffmpeg -y -v error -i "$STILL" -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 "$OUT/og.jpg"

ls -la "$OUT"

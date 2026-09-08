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
LOGO="assets/brand-kit/logo.svg"
OUT="public/media"
mkdir -p "$OUT"

# The logo master is a PNG inside an SVG wrapper. Unwrap it to a temp file so
# ffmpeg can read it; the wrapper itself is never touched.
LOGO_PNG="$(mktemp -u).png"
node -e "const fs=require('fs');const m=fs.readFileSync(process.argv[1],'utf8').match(/base64,([A-Za-z0-9+\/=]+)/);fs.writeFileSync(process.argv[2],Buffer.from(m[1],'base64'))" "$LOGO" "$LOGO_PNG"

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

# ---------------------------------------------------------------------------
# Brand mark
#
# assets/brand-kit/logo.svg is not vector art — it is a 2048px PNG in an SVG
# wrapper, so it is treated as a bitmap master like everything else here. The
# mark is a halftone seagull above the wordmark on a solid #fbfcfc ground with no
# alpha channel. The crop is measured off the master and takes the bird only; the
# wordmark is deliberately left behind, because Archivo already sets the name on
# the page and a picture of type would be the one blurry word on the site.
#
# White is keyed into a real alpha channel rather than composited away: the mark
# sits on the void in the closing and on a void ground in the icon, and a baked
# background would show its own edge on both. The ramp starts at 248, not 255, so
# the master's off-white ground lands at zero alpha instead of a faint haze.
BIRD="crop=1196:1080:476:260"
ALPHA="a='clip((248-r(X,Y))*255/240,0,255)'"

echo "→ brand mark (bird only, keyed to alpha, in the light world's cream)"
mkdir -p "$OUT/brand"
ffmpeg -y -v error -i "$LOGO_PNG" \
  -vf "$BIRD,scale=720:-1:flags=lanczos,format=rgba,geq=r='254':g='243':b='227':$ALPHA" \
  "$OUT/brand/mark-light.png"

echo "→ favicon / touch icon"
# One file at 512, not a ladder of sizes. Downscaling is exactly what makes a
# halftone readable small — the dots average back into a silhouette — so the
# browser is left to do it rather than baking a hand-tuned 16px version.
ffmpeg -y -v error -i "$LOGO_PNG" -f lavfi -i "color=c=0x0F0A06:s=512x512" \
  -filter_complex "[0:v]$BIRD,scale=384:-1:flags=lanczos,format=rgba,geq=r='254':g='238':b='195':$ALPHA[mark];[1:v][mark]overlay=(W-w)/2:(H-h)/2,format=rgb24" \
  -frames:v 1 public/icon.png

rm -f "$LOGO_PNG"

# ---------------------------------------------------------------------------
# Work shots
#
# Scaled to a common width and never cropped. Cropping these to one aspect ratio
# cost Erman Ofset the top of its own header — a screenshot is a record of a
# page, and trimming it to fit a box edits the record. The showcase sizes its
# frame to each picture instead, so the shots may differ in height.
echo "→ work shots"
mkdir -p "$OUT/work"
manifest=""
for master in assets/work/*; do
  [ -e "$master" ] || continue
  name="$(basename "${master%.*}")"
  out="$OUT/work/$name.webp"
  ffmpeg -y -v error -i "$master" -vf "scale=1400:-2:flags=lanczos" -q:v 82 "$out"
  dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$out")"
  manifest="$manifest{\"name\":\"$name\",\"w\":${dims%,*},\"h\":${dims#*,}},"
done

# Because the shots are no longer one shape, the page cannot assume one. This is
# how it learns each picture's size without shipping a probe to the browser: the
# showcase reserves the right box, so nothing jumps as the images arrive.
printf '[%s]
' "${manifest%,}" > src/content/work-shots.json
echo "  wrote src/content/work-shots.json"

ls -la "$OUT"

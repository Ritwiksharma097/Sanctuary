#!/bin/sh
# Convert finished renders (art/renders/*.png) to WebP in public/art/.
# Usage: art/export.sh [name ...]   (defaults to every render)
set -e
cd "$(dirname "$0")"
mkdir -p ../public/art
if [ $# -eq 0 ]; then set -- $(ls renders/*.png | xargs -n1 basename | sed 's/\.png$//'); fi
for name in "$@"; do
  convert "renders/$name.png" -quality 86 -define webp:alpha-quality=95 -define webp:method=6 "../public/art/$name.webp"
  echo "public/art/$name.webp $(du -h "../public/art/$name.webp" | cut -f1)"
done

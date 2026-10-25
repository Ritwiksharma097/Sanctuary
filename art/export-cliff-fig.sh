#!/bin/sh
# Pack the cliff figure frames (art/renders/cliff-fig/NNN.png) into one
# sprite sheet, 8 frames per row: public/art/cliff-figure.webp
set -e
cd "$(dirname "$0")"
montage renders/cliff-fig/*.png -tile 8x -geometry +0+0 -background none renders/cliff-figure-sheet.png
convert renders/cliff-figure-sheet.png -quality 88 -define webp:alpha-quality=95 -define webp:method=6 ../public/art/cliff-figure.webp
identify -format "public/art/cliff-figure.webp %wx%h " ../public/art/cliff-figure.webp; du -h ../public/art/cliff-figure.webp | cut -f1

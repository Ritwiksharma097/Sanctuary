#!/bin/sh
# Composite a transparent render onto the site's night background for review.
# Usage: art/preview.sh art/renders/well.png out.png
convert -size "$(identify -format '%wx%h' "$1")" xc:'#0d0d1a' "$1" -composite "$2"

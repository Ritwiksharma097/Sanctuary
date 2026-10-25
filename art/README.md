# Art

The site's illustrations are rendered in Blender from the scripts here, so
they can be tweaked and re-rendered rather than edited by hand.

| Script      | Output (public/art/)                        | Used by                    |
|-------------|---------------------------------------------|----------------------------|
| `well.py`   | `well.webp`                                 | Home (WishingWellSVG)      |
| `props.py`  | `coin.webp`, `moon.webp`, `nazar.webp`      | Home, Moon, Evil Eye       |
| `sky.py`    | `sky.webp`                                  | StarField (every page)     |
| `candle.py` | `candle-<colour>.webp`                      | The Flame                  |
| `cliff.py`  | `cliff.webp`, `cliff-figure[-up].webp`      | The Cliff                  |
| `basin.py`  | `basin.webp`                                | Let Go                     |

## Rendering

The scripts use the `bpy` module from PyPI (it bundles Cycles with the
OpenImageDenoise denoiser, which distro Blender builds often lack):

```sh
python3 -m venv /opt/bpyenv && /opt/bpyenv/bin/pip install bpy
/opt/bpyenv/bin/python art/well.py      # writes art/renders/well.png
art/export.sh well                      # → public/art/well.webp
```

Handy environment variables: `SAMPLES=32` and `PCT=40` for quick previews,
`DRY_RUN=1` to only print overlay positions, `ONLY=...` to pick parts of a
multi-render script. `art/preview.sh in.png out.png` composites a render onto
the site background for review.

Overlays drawn in code (coin drop, ripples, candle flames, nazar cracks, the
cliff's flying words, the basin swirl) line up with positions the scripts print
(`WATER_POS`, `WICK_TIP`, `FIGURE_HEAD`, …). If you move a camera, re-run with
`DRY_RUN=1` and update the matching constant in the component.

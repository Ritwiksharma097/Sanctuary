"""Stone water basin for Let Go's "washed away" step, seen from above at an
angle so the swirl overlay sits on the water. Renders art/renders/basin.png
and prints the water ellipse for the overlay."""
import math
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

lib.reset(seed=5)
stone = lib.mat_noisy("Stone", (0.08, 0.075, 0.07), (0.26, 0.24, 0.21), scale=7, bump=0.7, voronoi=True)

# Bowl: a lathed profile (outer wall, rim, inner wall) via a screw modifier
profile = [(0.55, 0.0), (0.9, 0.08), (1.1, 0.35), (1.18, 0.62), (1.12, 0.7), (0.98, 0.66), (0.9, 0.4), (0.6, 0.18), (0.0, 0.14)]
me = bpy.data.meshes.new("Bowl")
me.from_pydata([(r, 0, z) for r, z in profile], [(i, i + 1) for i in range(len(profile) - 1)], [])
bowl = bpy.data.objects.new("Bowl", me)
bpy.context.collection.objects.link(bowl)
screw = bowl.modifiers.new("Lathe", "SCREW")
screw.steps = screw.render_steps = 96
screw.use_merge_vertices = True
lib.smooth(bowl, subsurf=2)
lib.displace(bowl, strength=0.035, scale=0.25)
lib.assign(bowl, stone)

# Water: dark and glassy with a faint cold glow
water = lib.mat_basic("Water", (0.003, 0.01, 0.02), rough=0.22, emission=(0.06, 0.16, 0.32), strength=0.25)
bpy.ops.mesh.primitive_circle_add(vertices=96, radius=0.95, fill_type="NGON", location=(0, 0, 0.52))
w = bpy.context.object
lib.assign(w, water)

bpy.ops.mesh.primitive_plane_add(size=6)
bpy.context.object.is_shadow_catcher = True

lib.sun(2.2, (0.7, 0.8, 1.0), (math.radians(30), 0, math.radians(-150)))
lib.area(60, (0.6, 0.7, 1.0), (-1.5, 3, 1.2), size=2, target=(0, 0, 0.4))
lib.area(40, (1, 0.8, 0.6), (2.5, -2, 1.5), size=2, target=(0, 0, 0.4))
lib.camera((0, -4.6, 3.6), (0, 0, 0.35), lens=50)
lib.resolution(480, 360)
print("WATER_CENTER", lib.project((0, 0, 0.52)))
print("WATER_EDGE", lib.project((0.95, 0, 0.52)), lib.project((0, -0.95, 0.52)))
print("DRAIN", lib.project((0, 0, 0.52)))
lib.render("basin", 480, 360, int(os.environ.get("SAMPLES", 200)))

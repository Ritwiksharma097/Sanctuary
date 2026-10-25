"""Wax pillar candles on a brass dish, one render per colour, lit by a
warm point light where the (code-drawn) flame sits.
Renders art/renders/candle-<id>.png and prints the wick tip position."""
import math
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

SAMPLES = int(os.environ.get("SAMPLES", 200))
COLORS = {
    "white":  (0.85, 0.8, 0.68),
    "red":    (0.5, 0.03, 0.02),
    "green":  (0.06, 0.32, 0.12),
    "blue":   (0.05, 0.18, 0.5),
    "purple": (0.24, 0.07, 0.38),
    "pink":   (0.8, 0.35, 0.36),
    "yellow": (0.85, 0.55, 0.06),
}
ONLY = os.environ.get("ONLY", ",".join(COLORS)).split(",")

H, R = 2.2, 0.42


def wax(color):
    m = bpy.data.materials.new("Wax")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = 0.35
    b.inputs["Subsurface Weight"].default_value = 1.0
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.45, 0.25)
    b.inputs["Subsurface Scale"].default_value = 0.15
    return m


def build(color):
    lib.reset()
    m = wax(color)
    body = lib.cylinder("Body", R, H, (0, 0, H / 2 + 0.08), verts=64)
    lib.smooth(body, bevel=0.03, segments=3)
    lib.displace(body, strength=0.012, scale=0.3)
    lib.assign(body, m)
    # Melted pool: a soft lip around a slightly sunken top
    bpy.ops.mesh.primitive_torus_add(major_radius=R - 0.05, minor_radius=0.055, location=(0, 0, H + 0.07))
    lip = bpy.context.object
    lib.displace(lip, strength=0.02, scale=0.1)
    lib.smooth(lip)
    lib.assign(lip, m)
    # Wick: a slightly bent dark thread
    wick = lib.cylinder("Wick", 0.018, 0.22, (0, 0, H + 0.13), rot=(0.12, 0.05, 0), verts=12)
    lib.assign(wick, lib.mat_basic("Wick", (0.02, 0.015, 0.012), rough=0.9,
                                   emission=(1, 0.35, 0.08), strength=0.6))
    # Brass dish
    brass = lib.mat_noisy("Brass", (0.45, 0.3, 0.1), (0.8, 0.6, 0.3), scale=30, rough=0.3, bump=0.05)
    brass.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1
    dish = lib.cylinder("Dish", 0.8, 0.08, (0, 0, 0.04), verts=64)
    lib.smooth(dish, bevel=0.03, segments=3)
    lib.assign(dish, brass)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.78, minor_radius=0.04, location=(0, 0, 0.09))
    lib.assign(bpy.context.object, brass)

    # The flame's own light, plus cool moonlight
    lib.point(80, (1, 0.62, 0.28), (0, 0, H + 0.5), radius=0.15)
    lib.sun(1.2, (0.6, 0.7, 1), (math.radians(60), 0, math.radians(-150)))
    lib.area(25, (0.55, 0.65, 1), (-3, -4, 2.5), size=3, target=(0, 0, 1))
    lib.area(30, (1, 0.8, 0.55), (0, -2.5, 0.8), size=2, target=(0, 0, 0))   # gives the brass something to reflect
    lib.camera((0, -9, 2.6), (0, 0, 1.8), lens=72)


for cid in ONLY:
    build(COLORS[cid])
    lib.resolution(260, 560)
    print("WICK_TIP", lib.project((0, 0, H + 0.24)))
    lib.render(f"candle-{cid}", 260, 560, SAMPLES)

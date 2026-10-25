"""Let Go's matches: a matchbox (with a striker strip) and a single match.
Renders art/renders/matchbox.png and art/renders/match.png and prints
MATCH_HEAD (where the code-drawn flame sits) and STRIKER (the strip's band)."""
import math
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

SAMPLES = int(os.environ.get("SAMPLES", 200))
ONLY = os.environ.get("ONLY", "matchbox,match").split(",")


def label_material():
    """Deep blue label with a gold crescent and a thin gold border, drawn procedurally."""
    m = bpy.data.materials.new("Label")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.55
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(coord.outputs["Object"], sep.inputs[0])

    def math_(op, a, b=None):
        n = nt.nodes.new("ShaderNodeMath")
        n.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = v
            else:
                nt.links.new(v, n.inputs[i])
        return n.outputs[0]

    x, y = sep.outputs["X"], sep.outputs["Y"]
    # Crescent: inside one circle and outside an offset one
    d1 = math_("SQRT", math_("ADD", math_("POWER", x, 2), math_("POWER", y, 2)))
    d2 = math_("SQRT", math_("ADD", math_("POWER", math_("SUBTRACT", x, 0.08), 2), math_("POWER", math_("SUBTRACT", y, 0.05), 2)))
    crescent = math_("MULTIPLY", math_("LESS_THAN", d1, 0.22), math_("GREATER_THAN", d2, 0.2))
    # Border: near the label's edge
    border = math_("MAXIMUM",
                   math_("GREATER_THAN", math_("ABSOLUTE", x), 0.6),
                   math_("GREATER_THAN", math_("ABSOLUTE", y), 0.38))
    inner = math_("MULTIPLY", math_("LESS_THAN", math_("ABSOLUTE", x), 0.64), math_("LESS_THAN", math_("ABSOLUTE", y), 0.42))
    gold_mask = math_("MAXIMUM", crescent, math_("MULTIPLY", border, inner))
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(gold_mask, mix.inputs["Factor"])
    mix.inputs["A"].default_value = (0.01, 0.02, 0.08, 1)
    mix.inputs["B"].default_value = (0.85, 0.6, 0.22, 1)
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    metal = nt.nodes.new("ShaderNodeMath")
    metal.operation = "MULTIPLY"
    nt.links.new(gold_mask, metal.inputs[0])
    metal.inputs[1].default_value = 0.8
    nt.links.new(metal.outputs[0], b.inputs["Metallic"])
    return m


def lights():
    lib.area(300, (1, 0.95, 0.88), (-2, -3, 4), size=3, target=(0, 0, 0))
    lib.area(120, (0.6, 0.7, 1), (3, 1, 2), size=3, target=(0, 0, 0))
    lib.area(60, (1, 0.85, 0.6), (0, 3, 1), size=2, target=(0, 0, 0))


if "matchbox" in ONLY:
    lib.reset(seed=2)
    card = lib.mat_noisy("Card", (0.16, 0.11, 0.07), (0.3, 0.22, 0.14), scale=40, rough=0.8, bump=0.1)
    striker = lib.mat_noisy("Striker", (0.08, 0.05, 0.04), (0.22, 0.13, 0.09), scale=220, rough=1.0, bump=1.0)
    # Box 1.6 x 1.0 x 0.35, lying flat
    box = lib.cube("Box", (1.6, 1.0, 0.35), (0, 0, 0.175))
    lib.smooth(box, bevel=0.02, segments=3)
    lib.assign(box, card)
    label = lib.cube("Label", (1.4, 0.86, 0.004), (0, 0, 0.352))
    lib.assign(label, label_material())
    # Striker strip along the long side facing the camera
    strip = lib.cube("Strip", (1.5, 0.004, 0.26), (0, -0.502, 0.175))
    lib.assign(strip, striker)
    lights()
    lib.camera((0, -4.2, 3.3), (0, 0, 0.12), ortho=2.0)
    lib.resolution(360, 300)
    print("STRIKER", lib.project((-0.75, -0.5, 0.3)), lib.project((0.75, -0.5, 0.05)))
    lib.render("matchbox", 360, 300, SAMPLES)

if "match" in ONLY:
    lib.reset(seed=2)
    wood = lib.mat_noisy("Stick", (0.6, 0.45, 0.26), (0.78, 0.63, 0.42), scale=30, rough=0.8, bump=0.05)
    head_mat = lib.mat_noisy("Head", (0.35, 0.03, 0.02), (0.62, 0.08, 0.04), scale=60, rough=0.7, bump=0.3)
    L = 1.5
    stick = lib.cube("Stick", (0.055, 0.055, L), (0, 0, 0))
    lib.smooth(stick, bevel=0.006)
    lib.assign(stick, wood)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, location=(0, 0, L / 2 + 0.03))
    head = bpy.context.object
    head.scale = (1, 1, 1.45)
    lib.displace(head, strength=0.01, scale=0.05)
    lib.smooth(head)
    lib.assign(head, head_mat)
    # Lay it diagonally, head up and to the right
    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.collection.objects.link(pivot)
    for o in (stick, head):
        o.parent = pivot
    pivot.rotation_euler = (0, math.radians(40), 0)
    lights()
    lib.camera((0, -5, 0), (0, 0, 0), ortho=1.9)
    lib.resolution(220, 220)
    bpy.context.view_layer.update()
    print("MATCH_HEAD", lib.project(head.matrix_world.translation))
    lib.render("match", 220, 220, SAMPLES)

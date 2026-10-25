"""Night-sky backdrop: deep gradient, a faint diagonal Milky Way band with
dust lanes, soft nebula colour and thousands of tiny static stars. The live
twinkling stars (StarField) sit on top. Renders art/renders/sky.png."""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

scene = lib.reset()
scene.render.film_transparent = False
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.cycles.samples = int(os.environ.get("SAMPLES", 16))  # pure emission, barely needs samples
scene.cycles.use_denoising = False

m = bpy.data.materials.new("Sky")
m.use_nodes = True
nt = m.node_tree
nodes, links = nt.nodes, nt.links
nodes.remove(nodes["Principled BSDF"])
out = nodes["Material Output"]
emit = nodes.new("ShaderNodeEmission")
links.new(emit.outputs[0], out.inputs["Surface"])
coord = nodes.new("ShaderNodeTexCoord")


def node(kind, **inputs):
    n = nodes.new(kind)
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def math_op(op, a, b=None, c=None):
    n = nodes.new("ShaderNodeMath")
    n.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            links.new(v, n.inputs[i])
    return n.outputs[0]


def mix_rgb(fac, a, b, blend="MIX"):
    n = nodes.new("ShaderNodeMix")
    n.data_type = "RGBA"
    n.blend_type = blend
    for sock, v in (("Factor", fac), ("A", a), ("B", b)):
        if isinstance(v, (int, float)):
            n.inputs[sock].default_value = v
        elif isinstance(v, tuple):
            n.inputs[sock].default_value = v
        else:
            links.new(v, n.inputs[sock])
    return n.outputs["Result"]


uv = coord.outputs["Generated"]
sep = nodes.new("ShaderNodeSeparateXYZ")
links.new(uv, sep.inputs[0])
x, y = sep.outputs["X"], sep.outputs["Y"]

# Vertical gradient: slightly lifted indigo near the top, near-black at the horizon
grad = mix_rgb(y, (0.003, 0.003, 0.009, 1), (0.007, 0.008, 0.022, 1))

# Milky Way band along a diagonal: distance from the line y = 0.35 + 0.45x
d = math_op("ABSOLUTE", math_op("SUBTRACT", y, math_op("MULTIPLY_ADD", x, 0.45, 0.3)))
band = math_op("POWER", math_op("MAXIMUM", math_op("SUBTRACT", 1.0, math_op("MULTIPLY", d, 4.0)), 0.0), 2.2)

cloud = node("ShaderNodeTexNoise", Scale=4.0, Detail=12.0, Roughness=0.62)
links.new(uv, cloud.inputs["Vector"])
dust = node("ShaderNodeTexNoise", Scale=9.0, Detail=10.0, Roughness=0.7)
links.new(uv, dust.inputs["Vector"])
lanes = math_op("SUBTRACT", 1.0, math_op("POWER", dust.outputs["Fac"], 3.0))  # dark dust lanes
clumps = math_op("POWER", cloud.outputs["Fac"], 2.5)
glow = math_op("MULTIPLY", math_op("MULTIPLY", band, clumps), lanes)
milky = mix_rgb(math_op("MULTIPLY", glow, 0.35), grad, (0.2, 0.21, 0.3, 1), "ADD")

# Soft nebula colour off the band: violet and teal patches
neb = node("ShaderNodeTexNoise", Scale=1.6, Detail=6.0, Roughness=0.55)
links.new(uv, neb.inputs["Vector"])
neb_ramp = nodes.new("ShaderNodeValToRGB")
neb_ramp.color_ramp.elements[0].position = 0.35
neb_ramp.color_ramp.elements[0].color = (0.05, 0.015, 0.07, 1)
neb_ramp.color_ramp.elements[1].position = 0.7
neb_ramp.color_ramp.elements[1].color = (0.0, 0.03, 0.05, 1)
links.new(neb.outputs["Fac"], neb_ramp.inputs["Fac"])
sky = mix_rgb(0.12, milky, neb_ramp.outputs["Color"], "ADD")

# Tiny static stars: thresholded voronoi points, denser inside the band
stars = node("ShaderNodeTexVoronoi", Scale=420.0)
links.new(uv, stars.inputs["Vector"])
pts = math_op("POWER", math_op("MAXIMUM", math_op("SUBTRACT", 1.0, math_op("MULTIPLY", stars.outputs["Distance"], 6.0)), 0.0), 4.0)
twk = node("ShaderNodeTexWhiteNoise")
links.new(uv, twk.inputs["Vector"])
links.new(stars.outputs["Position"], twk.inputs["Vector"])
keep = math_op("GREATER_THAN", twk.outputs["Value"], math_op("SUBTRACT", 0.75, math_op("MULTIPLY", band, 0.3)))
star_amt = math_op("MULTIPLY", pts, keep)
final = mix_rgb(math_op("MULTIPLY", star_amt, 0.7), sky, (0.85, 0.88, 1.0, 1), "ADD")
links.new(final, emit.inputs["Color"])

bpy.ops.mesh.primitive_plane_add(size=2)
plane = bpy.context.object
plane.scale = (16 / 9, 1, 1)
lib.assign(plane, m)
lib.camera((0, 0, 5), (0, 0, 0), ortho=2 * 16 / 9)
lib.render("sky", 1920, 1080)

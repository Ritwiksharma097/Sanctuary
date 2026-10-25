"""Small props: gold coin, moon, and the glass nazar (evil eye) bead.
Renders art/renders/{coin,moon,nazar}.png."""
import math
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

SAMPLES = int(os.environ.get("SAMPLES", 200))
ONLY = os.environ.get("ONLY", "coin,moon,nazar").split(",")


def coin():
    lib.reset()
    gold = lib.mat_noisy("Gold", (0.75, 0.45, 0.1), (1.0, 0.78, 0.35), scale=40, rough=0.22, bump=0.05)
    gold.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1
    body = lib.cylinder("Coin", 1, 0.16, (0, 0, 0), verts=96)
    lib.smooth(body, bevel=0.04, segments=4)
    lib.assign(body, gold)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.86, minor_radius=0.045, location=(0, 0, 0.08))
    lib.assign(bpy.context.object, gold)
    # Embossed eight-point star
    bpy.ops.mesh.primitive_circle_add(vertices=16, radius=0.5, fill_type="NGON", location=(0, 0, 0.081))
    star = bpy.context.object
    for i, v in enumerate(star.data.vertices):
        if i % 2:
            v.co *= 0.42
    sol = star.modifiers.new("Solid", "SOLIDIFY")
    sol.thickness = 0.04
    lib.smooth(star, bevel=0.012)
    lib.assign(star, gold)
    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.collection.objects.link(pivot)
    for o in list(bpy.data.objects):
        if o.type == "MESH":
            o.parent = pivot
    pivot.rotation_euler = (math.radians(62), 0, math.radians(18))
    lib.area(300, (1, 0.92, 0.8), (-2, -3, 4), size=3, target=(0, 0, 0))
    lib.area(250, (1, 0.9, 0.75), (0, -4, 1), size=4, target=(0, 0, 0))
    lib.area(120, (0.6, 0.7, 1), (3, 1, 2), size=3, target=(0, 0, 0))
    lib.camera((0, -6, 0), (0, 0, 0), ortho=2.4)
    lib.render("coin", 160, 160, SAMPLES)


def moon():
    lib.reset()
    m = bpy.data.materials.new("Moon")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 1
    coord = nt.nodes.new("ShaderNodeTexCoord")
    # Maria: big soft dark patches
    maria = nt.nodes.new("ShaderNodeTexNoise")
    maria.inputs["Scale"].default_value = 1.6
    maria.inputs["Detail"].default_value = 3
    nt.links.new(coord.outputs["Object"], maria.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.42
    ramp.color_ramp.elements[0].color = (0.85, 0.81, 0.72, 1)
    ramp.color_ramp.elements[1].position = 0.62
    ramp.color_ramp.elements[1].color = (0.42, 0.4, 0.38, 1)
    nt.links.new(maria.outputs["Fac"], ramp.inputs["Fac"])
    # Craters: voronoi distance carved into the bump
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "F1"
    vor.inputs["Scale"].default_value = 9
    nt.links.new(coord.outputs["Object"], vor.inputs["Vector"])
    crater = nt.nodes.new("ShaderNodeMapRange")
    crater.inputs["From Min"].default_value = 0.0
    crater.inputs["From Max"].default_value = 0.35
    nt.links.new(vor.outputs["Distance"], crater.inputs["Value"])
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 30
    fine.inputs["Detail"].default_value = 10
    nt.links.new(coord.outputs["Object"], fine.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(crater.outputs["Result"], add.inputs[0])
    nt.links.new(fine.outputs["Fac"], add.inputs[1])
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.6
    nt.links.new(add.outputs[0], bmp.inputs["Height"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 0.35
    nt.links.new(ramp.outputs["Color"], mix.inputs["A"])
    nt.links.new(fine.outputs["Color"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    nt.links.new(bmp.outputs["Normal"], b.inputs["Normal"])
    # Faint warm self-glow so the dark side isn't pure black against the sky
    b.inputs["Emission Color"].default_value = (1, 0.93, 0.75, 1)
    b.inputs["Emission Strength"].default_value = 0.04
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1)
    sphere = bpy.context.object
    lib.smooth(sphere)
    lib.assign(sphere, m)
    s = lib.sun(4.0, (1, 0.96, 0.88), (math.radians(70), 0, math.radians(-25)))
    s.data.angle = math.radians(1)
    lib.camera((0, -6, 0), (0, 0, 0), ortho=2.08)
    lib.render("moon", 256, 256, SAMPLES)


def nazar():
    lib.reset()
    scene = bpy.context.scene
    # One domed glass disc; colour rings come from radial distance in object space
    m = bpy.data.materials.new("Nazar")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.06
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.02
    b.inputs["Subsurface Weight"].default_value = 0.15
    b.inputs["Subsurface Radius"].default_value = (0.3, 0.5, 1.0)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(coord.outputs["Object"], sep.inputs["Vector"])
    x2 = nt.nodes.new("ShaderNodeMath"); x2.operation = "MULTIPLY"
    y2 = nt.nodes.new("ShaderNodeMath"); y2.operation = "MULTIPLY"
    nt.links.new(sep.outputs["X"], x2.inputs[0]); nt.links.new(sep.outputs["X"], x2.inputs[1])
    nt.links.new(sep.outputs["Z"], y2.inputs[0]); nt.links.new(sep.outputs["Z"], y2.inputs[1])
    s2 = nt.nodes.new("ShaderNodeMath"); s2.operation = "ADD"
    nt.links.new(x2.outputs[0], s2.inputs[0]); nt.links.new(y2.outputs[0], s2.inputs[1])
    r = nt.nodes.new("ShaderNodeMath"); r.operation = "SQRT"
    nt.links.new(s2.outputs[0], r.inputs[0])
    # Slight organic wobble on the ring edges, like hand-made glass
    wob = nt.nodes.new("ShaderNodeTexNoise")
    wob.inputs["Scale"].default_value = 4
    nt.links.new(coord.outputs["Object"], wob.inputs["Vector"])
    wobm = nt.nodes.new("ShaderNodeMath"); wobm.operation = "MULTIPLY_ADD"
    nt.links.new(wob.outputs["Fac"], wobm.inputs[0])
    wobm.inputs[1].default_value = 0.04
    nt.links.new(r.outputs[0], wobm.inputs[2])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    stops = [
        (0.0, (0.004, 0.004, 0.008)),   # pupil
        (0.15, (0.18, 0.5, 0.85)),      # light blue iris
        (0.33, (0.9, 0.92, 0.94)),      # white
        (0.55, (0.004, 0.025, 0.2)),    # deep cobalt
    ]
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*stops[0][1], 1)
    cr.elements[1].position, cr.elements[1].color = stops[1][0], (*stops[1][1], 1)
    for pos, col in stops[2:]:
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    nt.links.new(wobm.outputs[0], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])

    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1)
    bead = bpy.context.object
    bead.scale = (1, 0.32, 1)   # flatten toward the camera (camera looks along +Y)
    lib.smooth(bead)
    lib.assign(bead, m)
    # Gold bail and loop at the top
    gold = lib.mat_basic("Gold", (0.9, 0.62, 0.25), rough=0.2, metal=1)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.03, location=(0, 0, 1.1),
                                     rotation=(math.pi / 2, 0, 0))
    lib.assign(bpy.context.object, gold)
    cap = lib.cylinder("Cap", 0.07, 0.1, (0, 0, 0.99), verts=24)
    lib.smooth(cap, bevel=0.02)
    lib.assign(cap, gold)
    # Studio-ish lights that give clean glassy highlights
    lib.area(400, (1, 0.97, 0.92), (-2.2, -3, 2.4), size=0.8, target=(0, 0, 0))
    lib.area(60, (0.6, 0.75, 1), (2.5, -2, -1), size=1, target=(0, 0, 0))
    lib.area(200, (1, 0.85, 0.6), (0, 3, 2), size=2, target=(0, 0, 0))
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.03, 0.04, 0.08, 1)
    lib.camera((0, -6, 0.1), (0, 0, 0.05), ortho=2.6)
    lib.render("nazar", 400, 400, SAMPLES)


for name in ONLY:
    globals()[name]()

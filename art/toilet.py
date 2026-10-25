"""Let Go's ending: a clean porcelain toilet, its flush lever as a separate
layer (so the page can press it), and the charred scrap left from the letter.

Renders:
  toilet.png         the toilet, lever excluded
  toilet-lever.png   just the lever (same camera; stack on top)
  toilet-lever-down.png  the lever pressed, swapped in for the flush
  scrap.png          a crumpled, charred scrap of paper
Prints WATER_CENTER / WATER_EDGE / LEVER_PIVOT for the overlays."""
import math
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

SAMPLES = int(os.environ.get("SAMPLES", 200))
ONLY = os.environ.get("ONLY", "toilet,lever,scrap").split(",")
PRESS = math.radians(28)
W, H = 520, 560


def porcelain():
    m = bpy.data.materials.new("Porcelain")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.85, 0.86, 0.88, 1)
    b.inputs["Roughness"].default_value = 0.12
    b.inputs["Coat Weight"].default_value = 0.6
    b.inputs["Coat Roughness"].default_value = 0.05
    b.inputs["Subsurface Weight"].default_value = 0.08
    return m


def lathe(name, profile, mat, steps=96, oval=1.0):
    me = bpy.data.meshes.new(name)
    me.from_pydata([(r, 0, z) for r, z in profile], [(i, i + 1) for i in range(len(profile) - 1)], [])
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    sc = o.modifiers.new("Lathe", "SCREW")
    sc.steps = sc.render_steps = steps
    sc.use_merge_vertices = True
    sc.use_normal_calculate = True
    o.scale.y = oval
    lib.smooth(o, subsurf=2)
    return lib.assign(o, mat)


def toilet_scene():
    lib.reset(seed=9)
    white = porcelain()
    chrome = lib.mat_basic("Chrome", (0.8, 0.8, 0.82), rough=0.08, metal=1)
    OVAL = 1.3

    # Bowl and pedestal in one lathed profile: foot, waist, bowl, rim, inner wall, trap
    lathe("Bowl", [
        (0.30, 0.0), (0.33, 0.03), (0.27, 0.12), (0.26, 0.28), (0.38, 0.42),
        (0.5, 0.56), (0.56, 0.68), (0.57, 0.74), (0.53, 0.77), (0.47, 0.76),
        (0.44, 0.70), (0.36, 0.58), (0.24, 0.50), (0.12, 0.44), (0.0, 0.43),
    ], white, oval=OVAL)

    # Water in the bowl: faint blue, clear and glossy
    water = bpy.data.materials.new("Water")
    water.use_nodes = True
    b = water.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.55, 0.72, 0.85, 1)
    b.inputs["Roughness"].default_value = 0.03
    b.inputs["Transmission Weight"].default_value = 0.85
    b.inputs["IOR"].default_value = 1.33
    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=0.33, fill_type="NGON", location=(0, -0.02, 0.56))
    wobj = bpy.context.object
    wobj.scale.y = OVAL * 0.95
    lib.assign(wobj, water)

    # Seat: a flattened oval ring resting on the rim
    bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.065, location=(0, 0, 0.8))
    seat = bpy.context.object
    seat.scale = (1, OVAL, 0.45)
    lib.smooth(seat, subsurf=1)
    lib.assign(seat, white)

    # Lid raised, leaning back against the tank
    lid = lib.cylinder("Lid", 0.44, 0.045, (0, 0.6, 1.12), verts=64)
    lid.scale.y = 1.22
    lid.rotation_euler.x = math.radians(-100)          # top edge tips back onto the tank
    lib.smooth(lid, bevel=0.02, segments=3)
    lib.assign(lid, white)

    # Tank and its cover
    tank = lib.cube("Tank", (0.95, 0.34, 0.62), (0, 0.86, 1.1))
    lib.smooth(tank, bevel=0.07, segments=5)
    lib.assign(tank, white)
    cover = lib.cube("TankLid", (1.0, 0.39, 0.06), (0, 0.86, 1.44))
    lib.smooth(cover, bevel=0.025, segments=4)
    lib.assign(cover, white)
    # Neck joining the tank to the bowl
    neck = lib.cube("Neck", (0.5, 0.3, 0.35), (0, 0.62, 0.72))
    lib.smooth(neck, bevel=0.08, segments=5)
    lib.assign(neck, white)

    # Flush lever on the tank's right side (facing the camera), arm pointing forward
    pivot = (0.49, 0.8, 1.3)
    base = lib.cylinder("LeverBase", 0.05, 0.03, pivot, rot=(0, math.pi / 2, 0), verts=32)
    lib.smooth(base, bevel=0.008)
    lib.assign(base, chrome)
    arm = lib.cube("LeverArm", (0.035, 0.22, 0.035), (pivot[0] + 0.03, pivot[1] - 0.11, pivot[2]))
    lib.smooth(arm, bevel=0.012, segments=3)
    lib.assign(arm, chrome)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.032, location=(pivot[0] + 0.03, pivot[1] - 0.22, pivot[2]))
    lib.smooth(bpy.context.object)
    lib.assign(bpy.context.object, chrome)
    lever = [base, arm, bpy.context.object]
    # Parent the arm and knob to a pivot so the press is a rotation about the lever's axle
    axle = bpy.data.objects.new("Axle", None)
    bpy.context.collection.objects.link(axle)
    axle.location = pivot
    for o in lever[1:]:
        o.parent = axle
        o.location = o.location - axle.location
    lever.append(axle)

    bpy.ops.mesh.primitive_plane_add(size=8)
    bpy.context.object.is_shadow_catcher = True

    # Moonlight from the window side, warm bathroom fill from the front
    s = lib.sun(2.0, (0.72, 0.8, 1.0), (math.radians(35), 0, math.radians(-140)))
    s.data.angle = math.radians(8)
    lib.area(90, (0.6, 0.7, 1.0), (-2.5, -2.5, 3), size=3, target=(0, 0.3, 0.7))
    lib.area(70, (1.0, 0.85, 0.65), (2.5, -2.0, 1.8), size=2.5, target=(0, 0.3, 0.7))
    lib.area(60, (0.6, 0.7, 1.0), (0, 3, 3), size=3, target=(0, 0.5, 1.0))
    lib.camera((0.9, -3.3, 2.7), (0, 0.25, 0.68), lens=50)
    lib.resolution(W, H)
    print("WATER_CENTER", lib.project((0, -0.02, 0.56)))
    print("WATER_EDGE", lib.project((0.33, -0.02, 0.56)), lib.project((0, -0.02 - 0.33 * OVAL * 0.95, 0.56)),
          lib.project((-0.33, -0.02, 0.56)), lib.project((0, -0.02 + 0.33 * OVAL * 0.95, 0.56)))
    print("LEVER_PIVOT", lib.project(pivot))
    print("LEVER_TIP", lib.project((pivot[0] + 0.03, pivot[1] - 0.22, pivot[2])))
    return lever


if "toilet" in ONLY or "lever" in ONLY:
    lever = toilet_scene()
    scene = bpy.context.scene
    others = [o for o in bpy.data.objects if o.type == "MESH" and o not in lever]
    if "toilet" in ONLY:
        for o in lever:
            o.hide_render = True
        lib.render("toilet", W, H, SAMPLES)
        for o in lever:
            o.hide_render = False
    if "lever" in ONLY:
        for o in others:
            o.is_holdout = True
        lib.render("toilet-lever", W, H, SAMPLES)
        bpy.data.objects["Axle"].rotation_euler.x = -PRESS     # tip of the arm goes down
        lib.render("toilet-lever-down", W, H, SAMPLES)

if "scrap" in ONLY:
    # Crumpled, charred paper: a heavily displaced, flattened ball with ember speckles
    lib.reset(seed=3)
    m = bpy.data.materials.new("Char")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.9
    coord = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 6
    nz.inputs["Detail"].default_value = 10
    nt.links.new(coord.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = (0.015, 0.012, 0.01, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (0.3, 0.27, 0.24, 1)   # grey ash
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    # Last embers: tiny bright specks where the noise peaks
    emb = nt.nodes.new("ShaderNodeValToRGB")
    emb.color_ramp.elements[0].position = 0.72
    emb.color_ramp.elements[0].color = (0, 0, 0, 1)
    emb.color_ramp.elements[1].position = 0.78
    emb.color_ramp.elements[1].color = (1, 0.35, 0.05, 1)
    nt.links.new(nz.outputs["Fac"], emb.inputs["Fac"])
    nt.links.new(emb.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 3
    # Low-poly ball pushed around at random: big flat facets read as folded paper
    import random
    random.seed(4)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1)
    ball = bpy.context.object
    for v in ball.data.vertices:
        v.co *= random.uniform(0.6, 1.25)
        v.co.z *= 0.7
    tex = bpy.data.textures.new("crumple", "VORONOI")
    tex.noise_scale = 0.5
    mod = ball.modifiers.new("Crumple", "DISPLACE")
    mod.texture = tex
    mod.strength = 0.15
    for p in ball.data.polygons:
        p.use_smooth = False
    lib.assign(ball, m)
    lib.area(250, (1, 0.95, 0.88), (-2, -3, 3), size=2, target=(0, 0, 0))
    lib.area(80, (0.6, 0.7, 1), (3, 1, 1), size=2, target=(0, 0, 0))
    lib.camera((0, -6, 2), (0, 0, 0), ortho=3.2)
    lib.render("scrap", 128, 128, SAMPLES)

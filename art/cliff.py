"""The Cliff: a rocky ledge on the left looking out over a moonlit valley of
layered ridges fading into mist. Sky is transparent so the site's shared
sky and moon show through.

Renders (all 1920x1080, same camera, so they stack exactly):
  cliff.png             landscape only
  cliff-figure.png      cloaked figure, arms at sides (landscape held out)
  cliff-figure-up.png   same figure, arms raised
Prints FIGURE_HEAD / FIGURE_FEET positions for the word-particle overlay."""
import math
import os
import random
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import bmesh  # noqa: E402  (must come after bpy)
from mathutils import Vector, noise  # noqa: E402
import lib  # noqa: E402

SAMPLES = int(os.environ.get("SAMPLES", 128))
ONLY = os.environ.get("ONLY", "landscape,figure,figure-up").split(",")
W, H = 1920, 1080
FOG = (0.05, 0.06, 0.12)

scene = lib.reset(seed=4)
scene.cycles.max_bounces = 4


def fog_material(name, base, rough=0.9, near=15.0, far=220.0, glow=0.9, bump=0.0, scale=1.0):
    """Atmospheric perspective: blend toward a faint blue fog glow with camera distance."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    coord = nt.nodes.new("ShaderNodeTexCoord")
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Detail"].default_value = 12
    nt.links.new(coord.outputs["Object"], tex.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*[c * 0.55 for c in base], 1)
    ramp.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(tex.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    if bump:
        bm = nt.nodes.new("ShaderNodeBump")
        bm.inputs["Strength"].default_value = bump
        nt.links.new(tex.outputs["Fac"], bm.inputs["Height"])
        nt.links.new(bm.outputs["Normal"], b.inputs["Normal"])
    cam = nt.nodes.new("ShaderNodeCameraData")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = near
    mr.inputs["From Max"].default_value = far
    nt.links.new(cam.outputs["View Distance"], mr.inputs["Value"])
    curve = nt.nodes.new("ShaderNodeMath")
    curve.operation = "POWER"
    curve.inputs[1].default_value = 0.7
    nt.links.new(mr.outputs["Result"], curve.inputs[0])
    fog = nt.nodes.new("ShaderNodeEmission")
    fog.inputs["Color"].default_value = (*FOG, 1)
    fog.inputs["Strength"].default_value = glow
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(curve.outputs[0], mix.inputs["Fac"])
    nt.links.new(b.outputs[0], mix.inputs[1])
    nt.links.new(fog.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m


def ridge(name, y, width, depth, height, base_z, seed, res=(260, 40), sharp=1.0, mat=None):
    """A mountain range: a grid displaced with ridged noise, tapered at its front and back."""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=res[0], y_segments=res[1], size=0.5)
    off = Vector((seed * 13.1, seed * 7.7, 0))
    vals = []
    for v in bm.verts:
        u, w = v.co.x + 0.5, v.co.y + 0.5            # 0..1 across, 0..1 front-to-back
        p = Vector((u * width / 60, w * depth / 60, 0)) + off
        vals.append((v, u, w, noise.ridged_multi_fractal(p, 0.9, 2.1, 6, 1.0, 2.0 * sharp)))
    lo = min(n for *_, n in vals)
    hi = max(n for *_, n in vals)
    for v, u, w, n in vals:
        n = (n - lo) / (hi - lo)                      # normalise to 0..1
        profile = math.sin(math.pi * min(1, w * 1.15)) ** 0.8       # rises from the front, falls behind
        v.co = Vector(((u - 0.5) * width, y + (w - 0.5) * depth, base_z + n ** 1.3 * height * profile))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    for p in me.polygons:
        p.use_smooth = True
    sub = obj.modifiers.new("Sub", "SUBSURF")
    sub.levels = sub.render_levels = 1
    if mat:
        lib.assign(obj, mat)
    return obj


# ── Landscape ────────────────────────────────────────────────────────────────
rock = fog_material("Rock", (0.075, 0.07, 0.075), near=4, far=200, bump=0.6, scale=3)
far_mat = fog_material("Far", (0.035, 0.038, 0.055), near=15, far=260, glow=0.7)

# Peaks are sized so each farther range rises a little higher in the frame
ridge("Ridge1", 30, 180, 24, 9, -10, 1, mat=far_mat)
ridge("Ridge2", 65, 300, 40, 15, -10, 2, mat=far_mat)
ridge("Ridge3", 135, 480, 70, 28, -10, 3, res=(320, 50), mat=far_mat)
ridge("Ridge4", 240, 800, 90, 36, -10, 4, res=(320, 50), mat=far_mat)

# Valley floor so nothing shows through beneath the ranges
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 120, -10))
floor = bpy.context.object
floor.scale = (900, 260, 1)
lib.assign(floor, far_mat)

# The ledge: a block with a ragged, displaced edge facing the valley
# (built at real size so the displacement isn't multiplied by an object scale)
cliff = lib.cube("Cliff", (14, 16, 30), (-11.6, 2, -15))
sub = cliff.modifiers.new("Sub", "SUBSURF")
sub.subdivision_type = "SIMPLE"
sub.levels = sub.render_levels = 6
tex = bpy.data.textures.new("CliffNoise", "CLOUDS")
tex.noise_scale = 1.6
tex.noise_depth = 6
disp = cliff.modifiers.new("Disp", "DISPLACE")
disp.texture = tex
disp.strength = 1.4
disp.texture_coords = "GLOBAL"
tex2 = bpy.data.textures.new("CliffFine", "CLOUDS")
tex2.noise_scale = 0.35
disp2 = cliff.modifiers.new("Disp2", "DISPLACE")
disp2.texture = tex2
disp2.strength = 0.25
disp2.texture_coords = "GLOBAL"
lib.assign(cliff, rock)

# Grass tufts along the ledge top (just dark spikes that catch the rim light)
grass = fog_material("Grass", (0.04, 0.06, 0.04), near=4, far=200)
for i in range(70):
    x = random.uniform(-11, -4.9)
    y = random.uniform(-2, 6)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.04, depth=random.uniform(0.2, 0.5),
                                    location=(x, y, 0.15), rotation=(random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), 0))
    lib.assign(bpy.context.object, grass)

# Valley mist: soft emissive, transparent wisps drifting between the ridges
mist = bpy.data.materials.new("Mist")
mist.use_nodes = True
nt = mist.node_tree
nt.nodes.remove(nt.nodes["Principled BSDF"])
coord = nt.nodes.new("ShaderNodeTexCoord")
nz = nt.nodes.new("ShaderNodeTexNoise")
nz.inputs["Scale"].default_value = 2.5
nz.inputs["Detail"].default_value = 6
nt.links.new(coord.outputs["Generated"], nz.inputs["Vector"])
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.45
ramp.color_ramp.elements[1].position = 0.8
nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
# Fade out toward the plane's front/back edges
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(coord.outputs["Generated"], sep.inputs[0])
edge = nt.nodes.new("ShaderNodeMath")
edge.operation = "PINGPONG"
edge.inputs[1].default_value = 0.5
nt.links.new(sep.outputs["Y"], edge.inputs[0])
edge2 = nt.nodes.new("ShaderNodeMath")
edge2.operation = "MULTIPLY"
edge2.inputs[1].default_value = 2.0
nt.links.new(edge.outputs[0], edge2.inputs[0])
amt = nt.nodes.new("ShaderNodeMath")
amt.operation = "MULTIPLY"
nt.links.new(ramp.outputs["Color"], amt.inputs[0])
nt.links.new(edge2.outputs[0], amt.inputs[1])
amt2 = nt.nodes.new("ShaderNodeMath")
amt2.operation = "MULTIPLY"
amt2.inputs[1].default_value = 0.85
nt.links.new(amt.outputs[0], amt2.inputs[0])
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (0.16, 0.19, 0.3, 1)
em.inputs["Strength"].default_value = 1.6
tr = nt.nodes.new("ShaderNodeBsdfTransparent")
mix = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(amt2.outputs[0], mix.inputs["Fac"])
nt.links.new(tr.outputs[0], mix.inputs[1])
nt.links.new(em.outputs[0], mix.inputs[2])
nt.links.new(mix.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
for i, (y, z, size) in enumerate([(22, -10, 120), (45, -9, 200), (95, -8, 320), (180, -6, 520)]):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, y, z))
    p = bpy.context.object
    p.scale = (size, size * 0.25, 1)
    p.name = f"Mist{i}"
    lib.assign(p, mist)

landscape = [o for o in bpy.data.objects if o.type == "MESH"]

# ── Figure ───────────────────────────────────────────────────────────────────
FEET = Vector((-5.6, 0.6, 0.12))
cloth = lib.mat_noisy("Cloak", (0.02, 0.02, 0.03), (0.06, 0.055, 0.07), scale=20, rough=0.9, bump=0.2)
skin = lib.mat_basic("Skin", (0.12, 0.09, 0.08), rough=0.7)
scarf_mat = lib.mat_noisy("Scarf", (0.35, 0.22, 0.06), (0.65, 0.45, 0.15), scale=15, rough=0.8)


def figure(arms_up):
    parts = []
    # Cloak: a flared, slightly windswept cone
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.42, radius2=0.15, depth=1.35,
                                    location=FEET + Vector((0, 0, 0.68)))
    c = bpy.context.object
    for v in c.data.vertices:
        if v.co.z < 0:   # hem swings downwind
            v.co.x += 0.12 * (-v.co.z)
    lib.smooth(c, subsurf=2)
    lib.displace(c, strength=0.04, scale=0.15)
    parts.append(lib.assign(c, cloth))
    # Hooded head
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=FEET + Vector((0.02, 0, 1.5)))
    hd = bpy.context.object
    hd.scale = (1, 1, 1.15)
    lib.smooth(hd)
    parts.append(lib.assign(hd, cloth))
    # Scarf streaming in the wind toward the valley
    bpy.ops.curve.primitive_bezier_curve_add(location=FEET + Vector((0.05, 0, 1.33)))
    sc = bpy.context.object
    pts = sc.data.splines[0].bezier_points
    pts[0].co, pts[0].handle_left, pts[0].handle_right = (0, 0, 0), (-0.1, 0, 0), (0.25, 0, 0.05)
    pts[1].co, pts[1].handle_left, pts[1].handle_right = (0.9, 0.05, -0.12), (0.6, 0, 0.05), (1.1, 0.1, -0.25)
    sc.data.bevel_depth = 0.035
    sc.data.extrude = 0.06
    sc.data.materials.append(scarf_mat)
    parts.append(sc)
    # Arms: hidden in the cloak when lowered, flung up and out when raised
    for side in (-1, 1):
        # Figure faces away from us, into the valley: arms spread across the frame (X)
        sh = FEET + Vector((side * 0.17, 0.02, 1.3))
        if arms_up:
            hand = sh + Vector((side * 0.42, 0.05, 0.5))
        else:
            hand = sh + Vector((side * 0.12, 0.03, -0.55))
        mid = (sh + hand) / 2
        vec = hand - sh
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=vec.length, location=mid)
        a = bpy.context.object
        a.rotation_euler = vec.to_track_quat("Z", "Y").to_euler()
        lib.smooth(a)
        parts.append(lib.assign(a, cloth))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.055, location=hand)
        parts.append(lib.assign(bpy.context.object, skin))
    return parts


# ── Lighting & camera ────────────────────────────────────────────────────────
moon = lib.sun(1.6, (0.75, 0.82, 1.0), (math.radians(75), 0, math.radians(200)))   # low, behind, upper right
moon.data.angle = math.radians(2)
lib.area(400, (0.5, 0.6, 1.0), (-4, -16, 6), size=10, target=(-4, 0, 0))            # faint cool fill
lib.camera((-1.0, -16.0, 2.4), (4, 30, -2.5), lens=30)
lib.resolution(W, H)
print("FIGURE_HEAD", lib.project(FEET + Vector((0, 0, 1.6))))
print("FIGURE_FEET", lib.project(FEET))
print("CLIFF_EDGE", lib.project((-4.7, 0.6, 0)))


def set_holdout(objs, on):
    for o in objs:
        o.is_holdout = on


if "landscape" in ONLY:
    lib.render("cliff", W, H, SAMPLES)

for name, up in (("figure", False), ("figure-up", True)):
    if name not in ONLY:
        continue
    fig = figure(up)
    set_holdout(landscape, True)
    lib.render(f"cliff-{name}", W, H, SAMPLES)
    set_holdout(landscape, False)
    for o in fig:
        bpy.data.objects.remove(o, do_unlink=True)

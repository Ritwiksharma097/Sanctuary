"""The Cliff: a rocky ledge on the left looking out over a moonlit valley of
layered ridges fading into mist. Sky is transparent so the site's shared
sky and moon show through.

Renders (same 1920x1080 camera, so the layers stack exactly):
  cliff.png               landscape only
  cliff-fig/NNN.png       the cloaked figure, animated, cropped to FIG_CROP
                          (landscape held out). Frames: idle loop, arms
                          raising, shout loop; art/export-cliff-fig.sh packs
                          the sprite sheet.
Prints FIGURE_HEAD and FIG_CROP for the overlays in the page."""
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
ONLY = os.environ.get("ONLY", "landscape,anim").split(",")
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
# Faces away from us, into the valley (+Y). Wind blows toward +X.
FEET = Vector((-5.6, 0.6, 0.12))
cloth = lib.mat_noisy("Cloak", (0.02, 0.02, 0.03), (0.07, 0.065, 0.08), scale=20, rough=0.85, bump=0.3)
skin = lib.mat_basic("Skin", (0.16, 0.12, 0.1), rough=0.6)
scarf_mat = lib.mat_noisy("Scarf", (0.4, 0.25, 0.06), (0.75, 0.52, 0.18), scale=15, rough=0.75)

IDLE, RAISE, SHOUT = 16, 10, 16
TAU = math.pi * 2


def pose_for(frame):
    """Pose parameters per frame. Loops use whole sine periods so they wrap seamlessly."""
    if frame < IDLE:
        ph = TAU * frame / IDLE
        return dict(raise_=0.0, wind=0.35, ph=ph, breath=math.sin(ph))
    if frame < IDLE + RAISE:
        k = (frame - IDLE + 1) / RAISE
        k = k * k * (3 - 2 * k)                          # ease in-out
        ph = TAU * (frame - IDLE) / 8
        return dict(raise_=k, wind=0.35 + 0.65 * k, ph=ph, breath=0.0)
    ph = TAU * (frame - IDLE - RAISE) / SHOUT
    return dict(raise_=1.0, wind=1.0, ph=ph, breath=0.0, strain=math.sin(2 * ph))


def lean_xform(p, raise_):
    """Lean back toward the camera and lift the chest as the arms go up."""
    ang = -0.12 * raise_
    rel = p - FEET
    y = rel.y * math.cos(ang) - rel.z * math.sin(ang)
    z = rel.y * math.sin(ang) + rel.z * math.cos(ang)
    return FEET + Vector((rel.x, y, z))


def mesh_obj(name, verts, faces, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    lib.smooth(o, subsurf=1)
    return lib.assign(o, mat)


def figure(frame):
    P = pose_for(frame)
    r, wind, ph = P["raise_"], P["wind"], P["ph"]
    strain = P.get("strain", 0.0)
    parts = []

    # Cloak: a lathed bell from the shoulders to the hem; the lower rings ripple downwind
    rings, segs = 12, 40
    verts, faces = [], []
    for i in range(rings):
        t = i / (rings - 1)                               # 0 = shoulders, 1 = hem
        z = 1.34 - t * 1.32
        rad = 0.16 + 0.27 * t ** 0.8 + 0.02 * P["breath"] * (1 - t)
        for j in range(segs):
            a = TAU * j / segs
            x, y = rad * math.cos(a), rad * 0.8 * math.sin(a)
            flap = wind * t ** 1.8
            x += flap * (0.13 + 0.04 * math.sin(ph + a * 2 + t * 4))
            y += flap * 0.035 * math.sin(ph * 2 + a * 3)
            z += flap * 0.025 * math.sin(ph + a * 3 + t * 5) * max(0, math.cos(a))
            p = lean_xform(FEET + Vector((x, y, z)), r)
            p.z = max(p.z, FEET.z + 0.01)                 # the hem never lifts off or sinks into the rock
            verts.append(p)
        if i:
            for j in range(segs):
                a0, a1 = (i - 1) * segs + j, (i - 1) * segs + (j + 1) % segs
                faces.append((a0, a1, a1 + segs, a0 + segs))
    parts.append(mesh_obj("Cloak", verts, faces, cloth))

    # Shoulders under the cloak give the silhouette some breadth
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=lean_xform(FEET + Vector((0, 0, 1.27)), r))
    sh = bpy.context.object
    sh.scale = (0.25, 0.15, 0.11)
    lib.smooth(sh)
    parts.append(lib.assign(sh, cloth))

    # Hood: rounded crown plus a soft point falling back, tilting up as it shouts
    tilt = 0.35 * r
    head_c = lean_xform(FEET + Vector((0.0, 0.0, 1.5)), r)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, location=head_c)
    hd = bpy.context.object
    hd.scale = (1.0, 1.2, 1.15)
    hd.rotation_euler.x = -tilt
    lib.smooth(hd)
    parts.append(lib.assign(hd, cloth))
    # Soft peak at the crown, blown slightly downwind, so the outline reads as a hood
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.1, depth=0.28,
                                    location=head_c + Vector((0.05 + 0.03 * wind, 0.02, 0.13)))
    pt = bpy.context.object
    pt.rotation_euler = (-0.1 - tilt * 0.5, math.radians(32 + 18 * wind), 0)
    lib.smooth(pt, subsurf=1)
    parts.append(lib.assign(pt, cloth))
    # Hood drape: a short flared cone from the head down onto the shoulders
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.21, radius2=0.12, depth=0.2,
                                    location=lean_xform(FEET + Vector((0, 0, 1.38)), r))
    dr = bpy.context.object
    dr.rotation_euler.x = -0.12 * r
    lib.smooth(dr, subsurf=1)
    parts.append(lib.assign(dr, cloth))

    # Arms: shoulder → elbow → hand, swinging up and out across the frame (X)
    for side in (-1, 1):
        shoulder = lean_xform(FEET + Vector((side * 0.21, 0.0, 1.3)), r)
        up = math.radians(8 + 140 * r + 4 * strain)          # 0 = hanging straight down
        bend = math.radians(30 * math.sin(math.pi * r) + 12 * (1 - r) - 8 * r)

        def direction(theta):
            return Vector((side * math.sin(theta), 0.06 + 0.1 * r, -math.cos(theta)))

        elbow = shoulder + direction(up) * 0.3
        hand = elbow + direction(up + bend) * 0.29
        for a_, b_, rad in ((shoulder, elbow, 0.062), (elbow, hand, 0.072)):
            vec = b_ - a_
            bpy.ops.mesh.primitive_cone_add(vertices=14, radius1=rad * 0.85, radius2=rad, depth=vec.length,
                                            location=(a_ + b_) / 2)
            seg = bpy.context.object
            seg.rotation_euler = vec.to_track_quat("Z", "Y").to_euler()
            lib.smooth(seg)
            parts.append(lib.assign(seg, cloth))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, location=hand + direction(up + bend) * 0.04)
        hnd = bpy.context.object
        hnd.scale = (0.9, 0.7, 1.2)
        lib.smooth(hnd)
        parts.append(lib.assign(hnd, skin))

    # Scarf streaming downwind, rippling harder as the wind rises
    neck = lean_xform(FEET + Vector((0.08, -0.05, 1.36)), r)
    bpy.ops.curve.primitive_bezier_curve_add(location=neck)
    sc = bpy.context.object
    spline = sc.data.splines[0]
    spline.bezier_points.add(2)
    spline.bezier_points.add(2)
    length = 0.55 + 0.6 * wind
    n = len(spline.bezier_points)
    for k, bp in enumerate(spline.bezier_points):
        t = k / (n - 1)
        x = t * length
        y = 0.06 * math.sin(ph * 2 + t * 7) * wind * t
        z = -0.22 * t * (1.2 - wind) + 0.09 * math.sin(ph * 2 + t * 8) * (0.3 + wind) * t
        bp.co = (x, y, z)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
        bp.radius = 1.0 - 0.5 * t                        # tapers toward the loose end
    sc.data.bevel_depth = 0.022
    sc.data.extrude = 0.04
    sc.data.materials.append(scarf_mat)
    parts.append(sc)
    return parts


# ── Lighting & camera ────────────────────────────────────────────────────────
moon = lib.sun(1.6, (0.75, 0.82, 1.0), (math.radians(75), 0, math.radians(200)))   # low, behind, upper right
moon.data.angle = math.radians(2)
lib.area(400, (0.5, 0.6, 1.0), (-4, -16, 6), size=10, target=(-4, 0, 0))            # faint cool fill
# A soft rim from the moon's side so the silhouette and arms read against the ridges
rim = lib.area(120, (0.7, 0.8, 1.0), (-3.5, 4.0, 3.0), size=2, target=FEET + Vector((0, 0, 1.2)))
lib.camera((-1.0, -16.0, 2.4), (4, 30, -2.5), lens=30)
lib.resolution(W, H)
print("FIGURE_HEAD", lib.project(FEET + Vector((0, 0, 1.6))))
print("FIGURE_FEET", lib.project(FEET))

# Crop window around everything the figure can reach (arms up, scarf out)
corners = [FEET + Vector((dx, 0, dz)) for dx in (-1.0, 1.75) for dz in (-0.1, 2.45)]
xs, ys = zip(*(lib.project(c) for c in corners))
CROP = (round(min(xs), 4), round(min(ys), 4), round(max(xs), 4), round(max(ys), 4))   # left, top, right, bottom
print("FIG_CROP", CROP)


def set_holdout(objs, on):
    for o in objs:
        o.is_holdout = on


if "landscape" in ONLY:
    lib.render("cliff", W, H, SAMPLES)

if "anim" in ONLY:
    scene.render.use_border = True
    scene.render.use_crop_to_border = True
    scene.render.border_min_x, scene.render.border_max_x = CROP[0], CROP[2]
    scene.render.border_min_y, scene.render.border_max_y = 1 - CROP[3], 1 - CROP[1]
    set_holdout(landscape, True)
    os.makedirs(os.path.join(lib.RENDERS, "cliff-fig"), exist_ok=True)
    frames = [int(f) for f in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else range(IDLE + RAISE + SHOUT)
    for fr in frames:
        fig = figure(fr)
        lib.render(f"cliff-fig/{fr:03d}", W, H, SAMPLES)
        for o in fig:
            bpy.data.objects.remove(o, do_unlink=True)

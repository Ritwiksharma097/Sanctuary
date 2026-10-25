"""The wishing well: stone ring, water, timber posts, shingled roof, winch,
bucket and a small lantern. Renders art/renders/well.png and prints the
on-image position of the water so the coin/ripple overlay can line up."""
import math
import os
import random
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import lib  # noqa: E402

scene = lib.reset(seed=11)

stone = lib.mat_noisy("Stone", (0.09, 0.075, 0.06), (0.3, 0.25, 0.19), scale=9, bump=0.6, voronoi=True)
stone_dark = lib.mat_noisy("StoneDark", (0.05, 0.045, 0.04), (0.19, 0.16, 0.13), scale=9, bump=0.6, voronoi=True)
moss = lib.mat_noisy("Moss", (0.03, 0.07, 0.025), (0.12, 0.2, 0.06), scale=25, bump=0.8)
mortar = lib.mat_basic("Mortar", (0.035, 0.03, 0.028), rough=1)
wood = lib.mat_wood("Wood", (0.1, 0.06, 0.03), (0.18, 0.11, 0.055))
wood_dark = lib.mat_wood("WoodDark", (0.055, 0.035, 0.02), (0.1, 0.062, 0.035))
shingle = lib.mat_noisy("Shingle", (0.03, 0.018, 0.012), (0.12, 0.065, 0.035), scale=14, rough=0.95, bump=0.6)
shingle_alt = lib.mat_noisy("ShingleAlt", (0.025, 0.02, 0.018), (0.09, 0.06, 0.045), scale=14, rough=0.95, bump=0.6)
iron = lib.mat_basic("Iron", (0.08, 0.075, 0.07), rough=0.45, metal=1)
rope = lib.mat_noisy("Rope", (0.2, 0.15, 0.08), (0.45, 0.36, 0.22), scale=60, bump=1.0)
gold = lib.mat_basic("Gold", (0.85, 0.6, 0.25), rough=0.25, metal=1)

# Water: deep blue, glossy, with a faint inner glow so it reads as "wishing" water
water = bpy.data.materials.new("Water")
water.use_nodes = True
nt = water.node_tree
b = nt.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.002, 0.006, 0.015, 1)
b.inputs["Roughness"].default_value = 0.12
b.inputs["Specular IOR Level"].default_value = 0.3
b.inputs["Emission Color"].default_value = (0.05, 0.16, 0.4, 1)
b.inputs["Emission Strength"].default_value = 0.12
wave = nt.nodes.new("ShaderNodeTexWave")
wave.wave_type = "RINGS"
wave.inputs["Scale"].default_value = 3.0
wave.inputs["Distortion"].default_value = 1.5
bump = nt.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.08
nt.links.new(wave.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])

R_OUT, R_IN = 1.0, 0.8
COURSES, COURSE_H = 5, 0.17

# Stone courses, staggered like brickwork
for c in range(COURSES):
    count = 16
    offset = (c % 2) * (math.pi / count)
    z = 0.09 + c * COURSE_H
    for i in range(count):
        a = offset + i * 2 * math.pi / count + random.uniform(-0.04, 0.04)
        r = (R_OUT + R_IN) / 2 + random.uniform(-0.015, 0.015)
        arc = 2 * math.pi * R_OUT / count * random.uniform(0.86, 0.95)
        h = COURSE_H * random.uniform(0.82, 0.94)
        s = lib.cube(f"Stone{c}_{i}", (arc, R_OUT - R_IN + random.uniform(0, 0.04), h),
                     (r * math.cos(a), r * math.sin(a), z), (0, 0, a + math.pi / 2))
        s.rotation_euler.x += random.uniform(-0.04, 0.04)
        lib.smooth(s, bevel=0.025, segments=3)
        s.modifiers.new("Sub", "SUBSURF").levels = 1
        lib.displace(s, strength=0.018, scale=0.12)
        lib.assign(s, stone if random.random() > 0.3 else stone_dark)
        # Moss creeping up the lower courses
        if c < 2 and random.random() < 0.35:
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.07,
                location=((R_OUT + 0.01) * math.cos(a), (R_OUT + 0.01) * math.sin(a), z - 0.05))
            mo = bpy.context.object
            mo.scale = (random.uniform(1, 2.2), random.uniform(1, 2.2), 0.5)
            lib.displace(mo, strength=0.04, scale=0.05)
            lib.assign(mo, moss)


# Capstones around the rim, slightly overhanging
top_z = COURSES * COURSE_H + 0.05
for i in range(12):
    a = i * 2 * math.pi / 12
    r = (R_OUT + R_IN) / 2
    s = lib.cube(f"Cap{i}", (2 * math.pi * R_OUT / 12 * 0.97, R_OUT - R_IN + 0.12, 0.1),
                 (r * math.cos(a), r * math.sin(a), top_z), (0, 0, a + math.pi / 2))
    lib.smooth(s, bevel=0.03, segments=3)
    lib.displace(s, strength=0.012, scale=0.15)
    lib.assign(s, stone)

# Hollow out the inside: a dark shaft wall then the water surface
shaft = lib.cylinder("Shaft", R_IN - 0.005, 0.8, (0, 0, top_z - 0.4), verts=64, caps=False)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.flip_normals()
bpy.ops.object.mode_set(mode="OBJECT")
lib.assign(shaft, stone_dark)

WATER_Z = top_z - 0.12
# Mortar fills between the stones, but only up to the water line so the surface shows
core = lib.cylinder("Mortar", R_OUT - 0.03, WATER_Z - 0.01, (0, 0, (WATER_Z - 0.01) / 2), verts=64)
lib.assign(core, mortar)
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=R_IN - 0.01, fill_type="NGON", location=(0, 0, WATER_Z))
w = bpy.context.object
w.name = "Water"
lib.assign(w, water)

# A few coins glinting just under the surface
for i in range(7):
    a = random.uniform(0, 2 * math.pi)
    r = random.uniform(0.1, 0.6)
    c = lib.cylinder(f"Coin{i}", 0.05, 0.008, (r * math.cos(a), r * math.sin(a), WATER_Z - 0.02),
                     rot=(random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), 0), verts=24)
    lib.assign(c, gold)

# Timber posts
POST_X, POST_TOP = 1.02, 2.25
for sx in (-1, 1):
    p = lib.cube(f"Post{sx}", (0.14, 0.14, POST_TOP), (sx * POST_X, 0, POST_TOP / 2))
    lib.smooth(p, bevel=0.015)
    lib.assign(p, wood)
    # Diagonal brace under the roof
    br = lib.cube(f"Brace{sx}", (0.07, 0.07, 0.5), (sx * (POST_X - 0.16), 0, POST_TOP - 0.2), (0, sx * 0.75, 0))
    lib.smooth(br, bevel=0.01)
    lib.assign(br, wood_dark)

# Winch drum with rope wraps and a crank
WINCH_Z = 1.75
drum = lib.cylinder("Drum", 0.075, 2 * POST_X, (0, 0, WINCH_Z), rot=(0, math.pi / 2, 0), verts=32)
lib.smooth(drum, bevel=0.01)
lib.assign(drum, wood_dark)
for i in range(9):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.085, minor_radius=0.014,
        location=(-0.2 + i * 0.03, 0, WINCH_Z), rotation=(0, math.pi / 2, 0))
    lib.assign(bpy.context.object, rope)
arm = lib.cube("CrankArm", (0.05, 0.04, 0.26), (POST_X + 0.12, 0, WINCH_Z - 0.11))
lib.assign(arm, iron)
handle = lib.cylinder("CrankHandle", 0.022, 0.16, (POST_X + 0.2, 0, WINCH_Z - 0.22), rot=(0, math.pi / 2, 0), verts=16)
lib.assign(handle, wood)

# Rope down to the bucket
BUCKET_Z = 1.08
r = lib.cylinder("Rope", 0.012, WINCH_Z - BUCKET_Z - 0.1, (-0.05, 0, (WINCH_Z + BUCKET_Z) / 2 + 0.05), verts=12)
lib.assign(r, rope)

bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.15, radius2=0.18, depth=0.24, location=(-0.05, 0, BUCKET_Z))
bucket = bpy.context.object
lib.smooth(bucket, bevel=0.01)
lib.assign(bucket, wood)
for z in (BUCKET_Z - 0.07, BUCKET_Z + 0.07):
    rr = 0.155 + (z - BUCKET_Z + 0.12) / 0.24 * 0.03
    bpy.ops.mesh.primitive_torus_add(major_radius=rr + 0.005, minor_radius=0.01, location=(-0.05, 0, z))
    lib.assign(bpy.context.object, iron)
bpy.ops.mesh.primitive_torus_add(major_radius=0.17, minor_radius=0.008, location=(-0.05, 0, BUCKET_Z + 0.14),
                                 rotation=(math.pi / 2, 0, 0))
lib.assign(bpy.context.object, iron)

# Roof: ridge beam, two pitched sides of overlapping shingles
RIDGE_Z, EAVE_Z, ROOF_Y = 2.75, 2.15, 0.95
ridge = lib.cube("Ridge", (2.9, 0.1, 0.1), (0, 0, RIDGE_Z + 0.02))
lib.smooth(ridge, bevel=0.01)
lib.assign(ridge, wood_dark)
pitch = math.atan2(RIDGE_Z - EAVE_Z, ROOF_Y)
slope_len = math.hypot(RIDGE_Z - EAVE_Z, ROOF_Y)
rows = 6
for side in (-1, 1):
    for row in range(rows):
        t = (row + 0.5) / rows
        y = side * t * ROOF_Y
        z = RIDGE_Z - t * (RIDGE_Z - EAVE_Z)
        n = 11
        for k in range(n):
            x = -1.4 + (k + 0.5 + (row % 2) * 0.5) * (2.8 / n)
            if abs(x) > 1.42:
                continue
            sh = lib.cube(f"Sh{side}{row}{k}", (2.8 / n * random.uniform(0.9, 0.98), slope_len / rows * 1.35, 0.035),
                          (x, y, z + 0.03), (side * -pitch + random.uniform(-0.03, 0.03), 0, random.uniform(-0.02, 0.02)))
            lib.smooth(sh, bevel=0.008)
            lib.assign(sh, shingle if random.random() > 0.35 else shingle_alt)
# Gable boards
for sx in (-1, 1):
    for side in (-1, 1):
        g = lib.cube(f"Gable{sx}{side}", (0.05, slope_len + 0.1, 0.09),
                     (sx * 1.45, side * ROOF_Y / 2, (RIDGE_Z + EAVE_Z) / 2), (side * -pitch, 0, 0))
        lib.assign(g, wood_dark)

# Lantern hanging from the right post
LANTERN = (POST_X + 0.02, -0.22, 1.5)
bracket = lib.cube("Bracket", (0.03, 0.25, 0.03), (POST_X, -0.12, 1.66))
lib.assign(bracket, iron)
frame = lib.cube("LanternFrame", (0.13, 0.13, 0.18), LANTERN)
frame.modifiers.new("Wire", "WIREFRAME").thickness = 0.012
lib.assign(frame, iron)
glass = lib.cube("LanternGlass", (0.11, 0.11, 0.16), LANTERN)
lib.assign(glass, lib.mat_basic("Flame", (1, 0.6, 0.2), emission=(1, 0.55, 0.18), strength=18))
cap = lib.cylinder("LanternCap", 0.09, 0.05, (LANTERN[0], LANTERN[1], LANTERN[2] + 0.12), verts=4)
lib.assign(cap, iron)
lib.point(30, (1, 0.6, 0.25), (LANTERN[0], LANTERN[1] - 0.12, LANTERN[2]), radius=0.06)

# Ground shadow so it sits on something
bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
ground = bpy.context.object
ground.is_shadow_catcher = True

# Moonlight from upper-left behind, cool fill from front, warm kicker
moon = lib.sun(2.6, (0.7, 0.8, 1.0), (math.radians(22), 0, math.radians(-160)))
moon.data.angle = math.radians(12)
lib.area(18, (0.5, 0.6, 1.0), (-3, -5, 4), size=4, target=(0, 0, 1))
lib.area(140, (0.6, 0.72, 1.0), (-1.5, 4, 3.5), size=3, target=(0, 0, 1))   # moon rim from behind
lib.area(30, (1.0, 0.7, 0.4), (3.5, -2.5, 1.5), size=2, target=(0, 0, 0.8))

lib.camera((0, -7.6, 3.4), (0, 0, 1.2), lens=52)

lib.resolution(720, 640)
print("WATER_POS", lib.project((0, 0, WATER_Z)))
print("WATER_EDGE", lib.project((R_IN, 0, WATER_Z)), lib.project((0, -R_IN, WATER_Z)))
print("COIN_START", lib.project((0.25, 0, 2.0)))
lib.render("well", 720, 640, samples=int(os.environ.get("SAMPLES", 160)))

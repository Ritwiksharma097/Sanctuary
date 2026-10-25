"""Shared helpers for the Blender art scripts in this folder.

Run a scene with:  /opt/bpyenv/bin/python art/<scene>.py
(the `bpy` wheel from PyPI, which ships Cycles with the OpenImageDenoise
denoiser; distro Blender builds often lack it).
Each scene renders transparent PNGs into art/renders/, which
art/export.sh converts to WebP under public/art/.
"""
import math
import os
import random

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.abspath(__file__))
RENDERS = os.path.join(ROOT, "renders")
os.makedirs(RENDERS, exist_ok=True)


def reset(seed=7):
    random.seed(seed)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 160
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.012, 0.014, 0.03, 1)
    bg.inputs["Strength"].default_value = 1.0
    return scene


def resolution(width, height):
    scene = bpy.context.scene
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100


def render(name, width, height, samples=None):
    """Render to art/renders/<name>.png. DRY_RUN=1 skips the render (handy
    for printing overlay positions from project()); PCT=50 renders smaller."""
    scene = bpy.context.scene
    resolution(width, height)
    if samples:
        scene.cycles.samples = samples
    scene.render.resolution_percentage = int(os.environ.get("PCT", 100))  # quick previews
    scene.render.filepath = os.path.join(RENDERS, name + ".png")
    if os.environ.get("DRY_RUN"):
        return
    bpy.ops.render.render(write_still=True)
    print("RENDERED", scene.render.filepath)


def project(point):
    """World point -> (x, y) fraction of the frame, origin top-left.
    Call resolution() first: the frame's aspect ratio affects the result."""
    from bpy_extras.object_utils import world_to_camera_view
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    co = world_to_camera_view(scene, scene.camera, Vector(point))
    return round(co.x, 4), round(1 - co.y, 4)


# ── Materials ────────────────────────────────────────────────────────────────

def _bsdf(mat):
    return mat.node_tree.nodes["Principled BSDF"]


def mat_basic(name, color, rough=0.6, metal=0.0, emission=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = _bsdf(m)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emission:
        b.inputs["Emission Color"].default_value = (*emission, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


def mat_noisy(name, dark, light, scale=6.0, rough=0.8, bump=0.3, detail=8.0, voronoi=False):
    """Base colour varies between two tones via noise; matching bump."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = _bsdf(m)
    b.inputs["Roughness"].default_value = rough
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = detail
    noise.inputs["Roughness"].default_value = 0.6
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (*light, 1)
    src = noise.outputs["Fac"]
    if voronoi:
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.inputs["Scale"].default_value = scale * 0.5
        nt.links.new(coord.outputs["Object"], vor.inputs["Vector"])
        mix = nt.nodes.new("ShaderNodeMath")
        mix.operation = "MULTIPLY"
        nt.links.new(noise.outputs["Fac"], mix.inputs[0])
        nt.links.new(vor.outputs["Distance"], mix.inputs[1])
        mix2 = nt.nodes.new("ShaderNodeMath")
        mix2.operation = "ADD"
        nt.links.new(mix.outputs[0], mix2.inputs[0])
        mix2.inputs[1].default_value = 0.25
        src = mix2.outputs[0]
    nt.links.new(src, ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = bump
    nt.links.new(noise.outputs["Fac"], bmp.inputs["Height"])
    nt.links.new(bmp.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_wood(name, dark, light, scale=3.0, stretch=12.0):
    """Wood grain: wave texture stretched along the object's local Z."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = _bsdf(m)
    b.inputs["Roughness"].default_value = 0.75
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (stretch, stretch, 1.0)
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "RINGS"
    wave.inputs["Scale"].default_value = scale
    wave.inputs["Distortion"].default_value = 3.0
    wave.inputs["Detail"].default_value = 4.0
    wave.inputs["Detail Scale"].default_value = 2.0
    nt.links.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].color = (*light, 1)
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.25
    nt.links.new(wave.outputs["Fac"], bmp.inputs["Height"])
    nt.links.new(bmp.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_glass(name, color, rough=0.02, ior=1.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = _bsdf(m)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["IOR"].default_value = ior
    b.inputs["Transmission Weight"].default_value = 1.0
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ── Geometry ─────────────────────────────────────────────────────────────────

def smooth(obj, bevel=0.0, segments=2, subsurf=0):
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
    if subsurf:
        mod = obj.modifiers.new("Subsurf", "SUBSURF")
        mod.levels = subsurf
        mod.render_levels = subsurf
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def displace(obj, strength=0.03, scale=0.5):
    tex = bpy.data.textures.new(obj.name + "_disp", "CLOUDS")
    tex.noise_scale = scale
    mod = obj.modifiers.new("Displace", "DISPLACE")
    mod.texture = tex
    mod.strength = strength
    mod.texture_coords = "GLOBAL"
    return obj


def cube(name, size, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return o


def cylinder(name, radius, depth, loc, rot=(0, 0, 0), verts=48, caps=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot,
                                        end_fill_type="NGON" if caps else "NOTHING")
    o = bpy.context.object
    o.name = name
    return o


def sun(strength, color, rot):
    bpy.ops.object.light_add(type="SUN", rotation=rot)
    s = bpy.context.object
    s.data.energy = strength
    s.data.color = color
    s.data.angle = math.radians(3)
    return s


def area(power, color, loc, size=2.0, target=(0, 0, 0)):
    bpy.ops.object.light_add(type="AREA", location=loc)
    a = bpy.context.object
    a.data.energy = power
    a.data.color = color
    a.data.size = size
    look_at(a, target)
    return a


def point(power, color, loc, radius=0.1):
    bpy.ops.object.light_add(type="POINT", location=loc)
    p = bpy.context.object
    p.data.energy = power
    p.data.color = color
    p.data.shadow_soft_size = radius
    return p


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=50, ortho=None):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object
    look_at(cam, target)
    if ortho:
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = ortho
    else:
        cam.data.lens = lens
    bpy.context.scene.camera = cam
    return cam

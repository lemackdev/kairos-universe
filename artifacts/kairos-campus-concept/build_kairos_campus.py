"""Kairos Campus conceptual visualization - reproducible Blender generator.

Run:  blender -b --python build_kairos_campus.py -- [--render preview|final|none] [--only 01,02]

Reads campus_inventory.json (functions, canon status, sources) and
layout_proposal.json (schematic geometry, all PROPOSED_VISUALIZATION), builds
the scene, validates the canon relationships, saves kairos_campus_master.blend
and renders the cameras.

Nothing in this file is canon. All sizes are schematic working units.
"""
import bpy, bmesh, json, math, os, random, re, sys
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name, default):
    return ARGV[ARGV.index(name) + 1] if name in ARGV else default
RENDER = arg("--render", "preview")
ONLY = [s for s in arg("--only", "").split(",") if s]

INV = json.load(open(os.path.join(HERE, "campus_inventory.json"), encoding="utf-8"))
LAY = json.load(open(os.path.join(HERE, "layout_proposal.json"), encoding="utf-8"))
AREAS = {a["id"]: a for a in INV["areas"]}
ROOMS = LAY["rooms"]
T, WH, FT = LAY["params"]["wall_thickness"], LAY["params"]["wall_height"], LAY["params"]["floor_thickness"]
DISCLAIMER = "IMPLANTAÇÃO CONCEITUAL, SEM ESCALA. FUNÇÕES BASEADAS NO CÂNONE; GEOMETRIA NÃO CANONIZADA."

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Kairos_Campus_Concept"
scene["disclaimer"] = DISCLAIMER
scene["canon_status_of_geometry"] = "PROPOSED_VISUALIZATION"

# ---------------------------------------------------------------- materials
def lin(c):
    return tuple(((v / 12.92) if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in c)

MATS = {}
def mat(name, rgb, rough=0.6, metal=0.0, emit=0.0, trans=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if b is None:
        nt.nodes.clear()
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        o = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(b.outputs[0], o.inputs[0])
    col = (*lin(rgb), 1.0)
    def setin(names, val):
        for n in names:
            if n in b.inputs:
                b.inputs[n].default_value = val
                return
    setin(["Base Color"], col)
    setin(["Roughness"], rough)
    setin(["Metallic"], metal)
    if trans:
        setin(["Transmission Weight", "Transmission"], trans)
    if emit:
        setin(["Emission Color", "Emission"], col)
        setin(["Emission Strength"], emit)
    m.diffuse_color = col
    MATS[name] = m
    return m

ZONE_COLORS = {  # diagram colors only, not canon branding
    "league": (0.42, 0.58, 0.84), "cs": (0.42, 0.70, 0.48), "commons": (0.64, 0.52, 0.82),
    "residential": (0.84, 0.74, 0.58), "recreation": (0.56, 0.65, 0.74), "performance": (0.90, 0.87, 0.78),
    "admin": (0.66, 0.66, 0.68), "dining": (0.86, 0.64, 0.48), "outdoor": (0.55, 0.72, 0.62), "future": (0.75, 0.75, 0.72),
}
ZONE_PT = {"league": "League of Legends", "cs": "Counter-Strike", "commons": "Kairos Commons", "residential": "Residencial",
           "recreation": "Recreation Center", "performance": "Performance e saúde", "admin": "Administração e mídia",
           "dining": "Refeitório (cor proposta)", "outdoor": "Recreação externa"}
ZF = {z: mat("Floor_" + z, c, 0.75) for z, c in ZONE_COLORS.items()}
WALL = mat("Wall_Plaster", (0.93, 0.92, 0.89), 0.8)
GLASS = mat("Glass", (0.75, 0.88, 0.92), 0.05, 0, 0, 0.9)
WOOD = mat("Wood_Oak", (0.72, 0.56, 0.38), 0.5)
WOOD_D = mat("Wood_Walnut", (0.38, 0.26, 0.18), 0.5)
DESK = mat("Desk_Top", (0.16, 0.16, 0.17), 0.45)
METAL = mat("Metal_Brushed", (0.62, 0.63, 0.65), 0.35, 0.9)
STEEL = mat("Stainless", (0.80, 0.81, 0.82), 0.25, 1.0)
DARK = mat("Plastic_Dark", (0.06, 0.06, 0.07), 0.5)
SCREEN = mat("Screen", (0.10, 0.16, 0.24), 0.15, 0, 0.6)
WHITE = mat("White", (0.95, 0.95, 0.95), 0.5)
FABRIC = mat("Fabric_Gray", (0.45, 0.46, 0.48), 0.9)
FABRIC_W = mat("Fabric_Warm", (0.70, 0.56, 0.44), 0.9)
FABRIC_D = mat("Fabric_Dark", (0.20, 0.21, 0.24), 0.95)
ACOUSTIC = mat("Acoustic_Panel", (0.28, 0.24, 0.34), 0.95)
ACOUSTIC2 = mat("Acoustic_Panel_Light", (0.52, 0.46, 0.60), 0.95)
GOLD = mat("Kairos_Gold", (0.78, 0.63, 0.29), 0.4, 0.6)
RED = mat("Accent_Red", (0.75, 0.22, 0.20), 0.5)
ORANGE = mat("Accent_Orange", (0.90, 0.45, 0.15), 0.5)
YELLOW = mat("Line_Yellow", (0.95, 0.80, 0.20), 0.5)
BLUE = mat("Accent_Blue", (0.20, 0.42, 0.80), 0.5)
GREEN = mat("Accent_Green", (0.20, 0.62, 0.36), 0.5)
BLACK = mat("Accent_Black", (0.03, 0.03, 0.035), 0.4)
LAWN = mat("Lawn", (0.44, 0.58, 0.36), 0.95)
TERRAIN = mat("Terrain", (0.58, 0.62, 0.52), 1.0)
PAVE = mat("Paving", (0.80, 0.78, 0.72), 0.85)
PLAZA = mat("Plaza_Concrete", (0.72, 0.71, 0.68), 0.8)
SMOOTH = mat("Smooth_Concrete", (0.60, 0.61, 0.63), 0.25)
COURT_IN = mat("Court_Maple", (0.80, 0.63, 0.40), 0.3)
COURT_OUT = mat("Court_Acrylic_Blue", (0.24, 0.42, 0.58), 0.7)
COURT_OUT2 = mat("Court_Acrylic_Green", (0.28, 0.50, 0.40), 0.7)
RUBBER = mat("Rubber_Floor", (0.33, 0.34, 0.37), 0.9)
LEAF = mat("Leaf", (0.24, 0.44, 0.24), 0.9)
LEAF2 = mat("Leaf_Light", (0.36, 0.54, 0.28), 0.9)
TRUNK = mat("Trunk", (0.32, 0.24, 0.17), 0.9)
ROOF = mat("Roof", (0.86, 0.85, 0.82), 0.8)
RES_WALL = mat("Residential_Wall", (0.90, 0.84, 0.74), 0.8)
LIGHT = mat("Light_Fixture", (1.0, 0.95, 0.85), 0.5, 0, 6.0)
SOFTBOX = mat("Softbox", (1.0, 0.98, 0.95), 0.5, 0, 2.0)
LABEL_TXT = mat("Label_Text", (1, 1, 1), 0.5, 0, 1.0)
LABEL_BG = mat("Label_Plate", (0.08, 0.09, 0.11), 0.6)
INK = mat("Board_Ink", (0.08, 0.09, 0.11), 0.6)
PAPER = mat("Board_Paper", (0.95, 0.94, 0.91), 0.9)
DASH = mat("Dashed_Outline", (0.35, 0.35, 0.35), 0.8)
GRAVEL = mat("Unbuilt_Ground", (0.70, 0.68, 0.62), 1.0)
BACKDROP = mat("Neutral_Backdrop", (0.80, 0.80, 0.79), 0.9)

# ---------------------------------------------------------------- collections
COLL_NAMES = ["00_Campus_Ground", "01_League_Building", "02_CounterStrike_Building", "03_Kairos_Commons", "04_Dining",
              "05_Recreation_Center", "06_Performance_Health", "07_Residential", "08_Administration_Media",
              "09_Outdoor_Recreation", "10_Future_Expansion_Unbuilt", "11_Circulation_Landscape",
              "12_Annotations_Legends", "13_Cameras_Lighting"]
COLL = {}
for n in COLL_NAMES:
    COLL[n] = bpy.data.collections.new(n)
    scene.collection.children.link(COLL[n])
def subcoll(parent, name):
    c = bpy.data.collections.new(name)
    COLL[parent].children.link(c) if isinstance(parent, str) else parent.children.link(c)
    return c
BOARD = subcoll("12_Annotations_Legends", "Board_Masterplan_Only")
LABELS = subcoll("12_Annotations_Legends", "Area_Labels")

# ---------------------------------------------------------------- primitives
MESH = {}
def mesh(kind, m):
    key = (kind, m.name)
    if key in MESH:
        return MESH[key]
    me = bpy.data.meshes.new(f"{kind}_{m.name}")
    bm = bmesh.new()
    if kind == "cube":
        bmesh.ops.create_cube(bm, size=1.0)
    elif kind == "cyl":
        bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.5, radius2=0.5, depth=1.0)
    else:
        bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.5)
        for f in bm.faces:
            f.smooth = True
    bm.to_mesh(me)
    bm.free()
    me.materials.append(m)
    MESH[key] = me
    return me

class Ctx:
    """Drawing context: a collection, an optional parent empty and a name prefix. Units are schematic."""
    def __init__(s, coll, parent=None, prefix="", world=True):
        s.coll, s.parent, s.prefix, s.world = coll, parent, prefix, world
    def _add(s, data, n, loc, scale, rot=(0, 0, 0)):
        o = bpy.data.objects.new(s.prefix + n, data)
        s.coll.objects.link(o)
        o.location, o.scale, o.rotation_euler = loc, scale, rot
        if s.parent:
            o.parent = s.parent
            if s.world:
                o.matrix_parent_inverse = Matrix.Translation(-s.parent.location)
        return o
    def box(s, n, cx, cy, z0, sx, sy, h, m, rz=0.0):
        return s._add(mesh("cube", m), n, (cx, cy, z0 + h / 2), (sx, sy, h), (0, 0, math.radians(rz)))
    def rect(s, n, r, z0, h, m):
        return s.box(n, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, z0, r[2] - r[0], r[3] - r[1], h, m)
    def cyl(s, n, cx, cy, z0, r, h, m, axis="Z"):
        if axis == "Z":
            return s._add(mesh("cyl", m), n, (cx, cy, z0 + h / 2), (2 * r, 2 * r, h))
        rot = (0, math.pi / 2, 0) if axis == "X" else (math.pi / 2, 0, 0)
        return s._add(mesh("cyl", m), n, (cx, cy, z0 + r), (2 * r, 2 * r, h), rot)
    def sph(s, n, cx, cy, cz, d, m, sz=1.0):
        return s._add(mesh("sph", m), n, (cx, cy, cz), (d, d, d * sz))
    def grp(s, n, x, y, rot=0.0, z=None):
        e = bpy.data.objects.new(s.prefix + n, None)
        e.empty_display_size = 0.3
        s.coll.objects.link(e)
        e.location = (x, y, FT if z is None else z)
        e.rotation_euler = (0, 0, math.radians(rot))
        if s.parent:
            e.parent = s.parent
            if s.world:
                e.matrix_parent_inverse = Matrix.Translation(-s.parent.location)
        return Ctx(s.coll, e, s.prefix + n + "_", world=False)

FONT = None
for fp in [os.path.join(bpy.utils.resource_path("LOCAL"), "datafiles", "fonts", "Inter.woff2")]:
    try:
        FONT = bpy.data.fonts.load(fp)
    except Exception:
        FONT = None
TEXTS = []
def text(coll, name, body, x, y, z, size, m, upright=False, rz=0.0, ax="CENTER", ay="CENTER", plate=None):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body, cu.size, cu.align_x, cu.align_y, cu.space_line = body, size, ax, ay, 0.95
    if FONT:
        cu.font = FONT
    cu.materials.append(m)
    if coll == BOARD:
        cu.offset = size * 0.012
    o = bpy.data.objects.new(name, cu)
    coll.objects.link(o)
    o.location = (x, y, z)
    o.rotation_euler = (math.pi / 2 if upright else 0, 0, math.radians(rz))
    if plate:
        TEXTS.append((o, coll, plate))
    return o

# ---------------------------------------------------------------- rooms
ROOT = {}
def room_root(rid):
    a = AREAS[rid]
    coll = subcoll(a["collection"], rid)
    r = ROOMS.get(rid, {}).get("rect")
    e = bpy.data.objects.new(rid, None)
    e.empty_display_type, e.empty_display_size = "CUBE", 0.5
    coll.objects.link(e)
    if r:
        e.location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    for k in ("canon_status", "canonical_name", "functional_purpose", "source_reference", "notes"):
        e[k] = a[k]
    e["layout_is_proposed"] = True
    e["zone"] = a["zone"]
    e["operational"] = bool(a["operational"])
    if a.get("shared_between"):
        e["shared_between"] = ", ".join(a["shared_between"])
    if a.get("known_interior"):
        e["known_interior"] = "; ".join(a["known_interior"])
    ROOT[rid] = e
    return Ctx(coll, e, rid + "_")

def wall(c, n, axis, fixed, a0, a1, ops):
    def seg(k, s, e, z0, h, m=WALL, th=T):
        if e - s < 1e-4:
            return
        if axis == "x":
            c.box(f"{n}_{k}", (s + e) / 2, fixed, z0, e - s, th, h, m)
        else:
            c.box(f"{n}_{k}", fixed, (s + e) / 2, z0, th, e - s, h, m)
    cur = a0
    for i, (ctr, w, kind) in enumerate(sorted(ops)):
        s, e = ctr - w / 2, ctr + w / 2
        seg(f"seg{i}", cur, s, FT, WH)
        if kind == "door":
            seg(f"lintel{i}", s, e, FT + 2.2, WH - 2.2)
        elif kind == "window":
            seg(f"sill{i}", s, e, FT, 0.9)
            seg(f"glass{i}", s, e, FT + 0.9, 1.5, GLASS, 0.04)
            seg(f"head{i}", s, e, FT + 2.4, WH - 2.4)
        cur = e
    seg("end", cur, a1, FT, WH)

def build_room(rid):
    spec = ROOMS[rid]
    x0, y0, x1, y1 = spec["rect"]
    c = room_root(rid)
    zone = AREAS[rid]["zone"]
    if spec.get("overlay"):
        c.rect("AreaFloor", spec["rect"], FT, 0.012, RUBBER)
    else:
        c.rect("Floor", spec["rect"], 0, FT, ZF[zone])
    walls, ops = spec.get("walls", "NESW"), spec.get("openings", {})
    if "S" in walls: wall(c, "Wall_S", "x", y0 + T / 2, x0, x1, ops.get("S", []))
    if "N" in walls: wall(c, "Wall_N", "x", y1 - T / 2, x0, x1, ops.get("N", []))
    ya, yb = (y0 + T if "S" in walls else y0), (y1 - T if "N" in walls else y1)
    if "W" in walls: wall(c, "Wall_W", "y", x0 + T / 2, ya, yb, ops.get("W", []))
    if "E" in walls: wall(c, "Wall_E", "y", x1 - T / 2, ya, yb, ops.get("E", []))
    return c, x0, y0, x1, y1

LABEL_POS = {}
def label(rid, x, y, size=None, z=FT + 0.06):
    a = AREAS[rid]
    if not a["label"]:
        return
    r = ROOMS.get(rid, {}).get("rect")
    if size is None:
        size = max(0.9, min(1.6, (min(r[2] - r[0], r[3] - r[1]) / 6.5) if r else 1.2))
    elif size >= 0.7:
        size = max(size, 0.85)
    LABEL_POS[rid] = [round(x, 2), round(y, 2), round(z, 2)]
    text(LABELS, "Label_" + rid, a["label"], x, y, z, size, LABEL_TXT, plate=LABEL_BG)

def pendants(c, x0, y0, x1, y1, nx=2, ny=1):
    for i in range(nx):
        for j in range(ny):
            px, py = x0 + (x1 - x0) * (i + 0.5) / nx, y0 + (y1 - y0) * (j + 0.5) / ny
            c.box(f"Pendant_{i}_{j}", px, py, FT + 2.85, 1.6, 0.07, 0.04, LIGHT)
            c.box(f"PendantRod_{i}_{j}", px, py, FT + 2.89, 0.02, 0.02, 0.2, METAL)

# ---------------------------------------------------------------- furniture (all illustrative)
def chair(g, x, y, m=FABRIC_D, accent=None):
    """Gaming or task chair inside a group; faces +Y."""
    g.cyl("ChairBase", x, y, 0, 0.3, 0.05, DARK)
    g.cyl("ChairPost", x, y, 0.05, 0.04, 0.38, METAL)
    g.box("ChairSeat", x, y, 0.43, 0.5, 0.5, 0.09, m)
    g.box("ChairBack", x, y - 0.25, 0.5, 0.48, 0.09, 0.72, m)
    if accent:
        g.box("ChairStripe", x, y - 0.3, 0.75, 0.2, 0.012, 0.42, accent)

def seat(c, n, x, y, dx, dy, m=WOOD):
    """Simple side chair facing (dx, dy)."""
    c.box(n + "_Seat", x, y, FT + 0.42, 0.44, 0.44, 0.05, m)
    c.box(n + "_Leg", x, y, FT, 0.3, 0.3, 0.42, METAL)
    c.box(n + "_Back", x - dx * 0.2, y - dy * 0.2, FT + 0.47, 0.44 if dx == 0 else 0.05, 0.44 if dy == 0 else 0.05, 0.45, m)

def table(c, n, x, y, sx, sy, m=WOOD, h=0.74):
    c.box(n + "_Top", x, y, FT + h - 0.05, sx, sy, 0.05, m)
    lx, ly = (sx / 2 - 0.15, 0) if sx >= sy else (0, sy / 2 - 0.15)
    for k, sgn in (("A", -1), ("B", 1)):
        c.box(f"{n}_Leg{k}", x + sgn * lx, y + sgn * ly, FT, 0.06 if sx >= sy else sx * 0.7, sy * 0.7 if sx >= sy else 0.06, h - 0.05, METAL)

def table_chairs(c, n, x, y, sx, sy, per_side, m=WOOD):
    table(c, n, x, y, sx, sy, m)
    for i in range(per_side):
        if sx >= sy:
            px = x - sx / 2 + sx * (i + 0.5) / per_side
            seat(c, f"{n}_ChairS{i}", px, y - sy / 2 - 0.3, 0, 1)
            seat(c, f"{n}_ChairN{i}", px, y + sy / 2 + 0.3, 0, -1)
        else:
            py = y - sy / 2 + sy * (i + 0.5) / per_side
            seat(c, f"{n}_ChairW{i}", x - sx / 2 - 0.3, py, 1, 0)
            seat(c, f"{n}_ChairE{i}", x + sx / 2 + 0.3, py, -1, 0)

def workstation(c, n, x, y, rot, accent, gaming=True):
    g = c.grp(n, x, y, rot)
    g.box("Desk", 0, 0, 0.70, 1.5, 0.72, 0.04, DESK)
    g.box("LegL", -0.72, 0, 0, 0.04, 0.66, 0.70, METAL)
    g.box("LegR", 0.72, 0, 0, 0.04, 0.66, 0.70, METAL)
    g.box("Monitor", 0, 0.2, 0.90, 0.62, 0.03, 0.36, SCREEN)
    g.box("MonitorBezel", 0, 0.215, 0.89, 0.64, 0.01, 0.38, DARK)
    g.box("MonitorStand", 0, 0.23, 0.74, 0.06, 0.05, 0.2, METAL)
    g.box("MonitorFoot", 0, 0.23, 0.74, 0.26, 0.16, 0.012, METAL)
    g.box("Keyboard", 0, -0.12, 0.74, 0.36, 0.12, 0.02, DARK)
    if gaming:
        g.box("Mousepad", 0.36, -0.1, 0.74, 0.34, 0.3, 0.004, accent)
        g.box("PC", -0.56, 0.08, 0.74, 0.2, 0.42, 0.42, DARK)
        g.box("PCGlass", -0.455, 0.08, 0.77, 0.004, 0.36, 0.36, accent)
        g.cyl("Headset", 0.6, 0.2, 0.74, 0.09, 0.05, DARK)
        g.box("CableTray", 0, 0.3, 0.58, 1.3, 0.08, 0.06, METAL)
    g.box("Mouse", 0.36, -0.1, 0.745, 0.06, 0.1, 0.03, DARK)
    chair(g, 0, -0.68, FABRIC_D, accent if gaming else None)
    return g

def sofa(c, n, x, y, rot, w=2.2, m=FABRIC):
    g = c.grp(n, x, y, rot)
    g.box("Base", 0, 0, 0.05, w, 0.9, 0.38, m)
    g.box("Back", 0, 0.36, 0.43, w, 0.18, 0.4, m)
    g.box("ArmL", -w / 2 + 0.09, 0, 0.43, 0.18, 0.9, 0.2, m)
    g.box("ArmR", w / 2 - 0.09, 0, 0.43, 0.18, 0.9, 0.2, m)
    return g

def plant(c, n, x, y, s=1.0):
    c.cyl(n + "_Pot", x, y, FT, 0.22 * s, 0.4 * s, WHITE)
    c.sph(n + "_Leaves", x, y, FT + 0.85 * s, 0.8 * s, LEAF, 1.2)

def wall_screen(c, n, x, y, facing, w=2.0):
    sx, sy = (w, 0.05) if facing in "NS" else (0.05, w)
    c.box(n, x, y, FT + 1.2, sx, sy, w * 0.56, SCREEN)

def whiteboard(c, n, x, y, facing, w=2.0):
    sx, sy = (w, 0.04) if facing in "NS" else (0.04, w)
    c.box(n, x, y, FT + 1.0, sx, sy, 1.2, WHITE)
    c.box(n + "_Tray", x, y, FT + 0.96, sx if sx > 1 else 0.08, sy if sy > 1 else 0.08, 0.03, METAL)

def cabinet(c, n, x, y, sx, sy, h=2.0, m=WOOD):
    c.box(n, x, y, FT, sx, sy, h, m)

def training_room(rid, accent, team_rug):
    c, x0, y0, x1, y1 = build_room(rid)
    cx = (x0 + x1) / 2
    c.box("TeamRug", cx, y1 - 2.3, FT, 10.0, 3.4, 0.012, team_rug)
    for i in range(5):  # five stations = five-player roster; arrangement is illustrative
        workstation(c, f"Station_{i + 1}", cx + (i - 2) * 1.9, y1 - 1.6, 0, accent)
    for side, x in (("W", x0 + T + 0.03), ("E", x1 - T - 0.03)):
        c.box(f"AccentBand_{side}", x, (y0 + y1) / 2, FT + 2.3, 0.03, (y1 - y0) - 1.0, 0.25, accent)
    table_chairs(c, "CoachTable", cx - 1.5, y0 + 3.0, 3.0, 1.1, 3, WOOD_D)
    wall_screen(c, "ReviewScreen_Proposed", x0 + T + 0.06, y0 + 3.0, "W", 2.4)
    whiteboard(c, "Whiteboard", x1 - T - 0.05, y0 + 3.2, "E", 2.4)
    sofa(c, "Sofa", cx + 2.8, y0 + 1.2, 180, 2.2, FABRIC_D)
    plant(c, "Plant", x1 - 0.9, y0 + 0.9)
    pendants(c, x0, y1 - 6.0, x1, y1, 2, 1)
    label(rid, cx, y0 + 5.9)
    return c

def review_room(rid):
    c, x0, y0, x1, y1 = build_room(rid)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    table_chairs(c, "ReviewTable", cx - 2.5, cy, 4.2, 1.3, 4, WOOD_D)
    wall_screen(c, "ReviewScreen", x0 + T + 0.06, cy, "W", 3.0)
    workstation(c, "CoachDesk_1", x1 - 2.2, y0 + 2.0, -90, METAL, False)
    workstation(c, "CoachDesk_2", x1 - 2.2, y0 + 5.0, -90, METAL, False)
    whiteboard(c, "Whiteboard", cx + 2.0, y0 + T + 0.05, "S", 2.4)
    plant(c, "Plant", x0 + 0.9, y0 + 0.9)
    pendants(c, x0, y0, x1, y0 + 5.0, 2, 1)
    label(rid, cx, cy + 2.6, 0.8)

def circulation(rid, benches=()):
    c, x0, y0, x1, y1 = build_room(rid)
    for i, (bx, by) in enumerate(benches):
        c.box(f"Bench_{i}", bx, by, FT, 1.6, 0.45, 0.45, WOOD)
    return c

# ---------------------------------------------------------------- ground and landscape
G = Ctx(COLL["00_Campus_Ground"])
G.box("Terrain_Context", 0, -14, -0.3, 900, 900, 0.2, TERRAIN)
site = LAY["site"]
G.rect("Site_Lawn_Proposed_Extent", site, -0.1, 0.1, LAWN)
L = Ctx(COLL["11_Circulation_Landscape"])
for i, p in enumerate(LAY["paths"]):
    L.rect(f"Path_{i:02d}", p, 0, 0.03, PAVE)

# ---------------------------------------------------------------- 01 League building
training_room("LoL_Black_Training", BLACK, mat("Rug_Black", (0.10, 0.10, 0.11), 0.95))
training_room("LoL_Blue_Training", BLUE, mat("Rug_Blue", (0.16, 0.26, 0.48), 0.95))
training_room("LoL_White_Training", WHITE, mat("Rug_White", (0.86, 0.86, 0.84), 0.95))
review_room("LoL_Review_Coaching_Support")
circulation("LoL_Circulation", [(-8, -12.4), (2, -12.4)])
L.rect("LoL_Terrace_Proposed", [-11, -22, 6, -13.2], 0, 0.05, PLAZA)

# ---------------------------------------------------------------- 02 Counter-Strike building
training_room("CS_Main_Training", GOLD, mat("Rug_Charcoal", (0.14, 0.14, 0.15), 0.95))
training_room("CS_Green_Training", GREEN, mat("Rug_Green", (0.14, 0.34, 0.22), 0.95))
review_room("CS_Tactical_Review_Support")
circulation("CS_Circulation", [(18, -12.4)])
L.rect("CS_Terrace_Proposed", [14, -22, 24, -13.2], 0, 0.05, PLAZA)

# ---------------------------------------------------------------- 03 Kairos Commons
def commons():
    # Shared lounge (Episode 100 "sala principal")
    c, x0, y0, x1, y1 = build_room("Commons_Shared_Lounge")
    cx = (x0 + x1) / 2
    c.box("Rug_TV", cx, y1 - 4.0, FT, 6.5, 5.0, 0.012, FABRIC_W)
    wall_screen(c, "TV", cx, y1 - T - 0.05, "N", 2.6)
    c.box("TV_Console", cx, y1 - 0.55, FT, 2.8, 0.45, 0.5, WOOD_D)
    c.box("GameConsole", cx - 0.8, y1 - 0.55, FT + 0.5, 0.3, 0.26, 0.07, DARK)
    sofa(c, "Sofa_A", cx, y1 - 5.6, 180, 3.0)
    sofa(c, "Sofa_B", cx - 2.9, y1 - 3.8, -90, 2.2)
    sofa(c, "Sofa_C", cx + 2.9, y1 - 3.8, 90, 2.2)
    c.box("CoffeeTable", cx, y1 - 3.8, FT, 1.4, 0.8, 0.36, WOOD)
    for i, (bx, by, m) in enumerate([(cx - 1.6, y1 - 2.2, ZF["commons"]), (cx + 1.7, y1 - 2.0, ORANGE)]):
        c.sph(f"Beanbag_{i}", bx, by, FT + 0.3, 0.95, m, 0.6)
    k = c.grp("Karaoke_Movable", x1 - 2.0, y1 - 1.6, -30)  # movable kit, no dedicated room
    k.box("SpeakerCart", 0, 0, 0, 0.5, 0.45, 0.9, DARK)
    k.cyl("MicStand", 0.7, 0, 0, 0.02, 1.4, METAL)
    k.cyl("MicStandBase", 0.7, 0, 0, 0.16, 0.02, DARK)
    k.sph("Mic", 0.7, 0, 1.43, 0.08, DARK)
    table_chairs(c, "GroupMealTable", cx, y0 + 7.4, 5.0, 1.2, 5, WOOD)
    c.cyl("TabletopTable_Top", x0 + 3.0, y0 + 3.0, FT + 0.7, 0.75, 0.05, WOOD_D)
    c.cyl("TabletopTable_Leg", x0 + 3.0, y0 + 3.0, FT, 0.08, 0.7, METAL)
    for i, (dx, dy) in enumerate([(1, 0), (-1, 0), (0, 1), (0, -1)]):
        seat(c, f"TabletopChair_{i}", x0 + 3.0 - dx * 1.1, y0 + 3.0 - dy * 1.1, dx, dy)
    for i, m in enumerate([RED, BLUE, YELLOW]):
        c.box(f"BoardGame_{i}", x0 + 2.8 + i * 0.2, y0 + 3.0 + i * 0.1, FT + 0.75 + i * 0.04, 0.3, 0.3, 0.04, m)
    cabinet(c, "Bookshelf", x1 - T - 0.25, y0 + 9.5, 0.4, 2.6, 1.8, WOOD)
    plant(c, "Plant_A", x0 + 0.9, y1 - 0.9, 1.2)
    plant(c, "Plant_B", x1 - 0.9, y0 + 0.9, 1.2)
    text(c.coll, "Commons_Sign", "KAIROS COMMONS", cx - 4.4, y1 - T - 0.02, FT + 2.55, 0.34, INK, upright=True)
    pendants(c, x0, y0, x1, y1, 2, 3)
    label("Commons_Shared_Lounge", cx, y0 + 11.3)

    c, x0, y0, x1, y1 = build_room("Commons_Corridor")
    c.box("Bench", -60, y0 + 0.5, FT, 1.8, 0.45, 0.45, WOOD)
    plant(c, "Plant", -45.2, y0 + 0.7)

    # Maker Lab
    c, x0, y0, x1, y1 = build_room("Commons_Maker_Lab")
    cx = (x0 + x1) / 2
    for i, by in enumerate([y0 + 4.0, y0 + 8.2]):
        c.box(f"Bench_{i}_Top", cx - 0.6, by, FT + 0.86, 3.6, 1.3, 0.07, WOOD)
        for k, sx in enumerate([-1.6, 1.6]):
            c.box(f"Bench_{i}_Leg{k}", cx - 0.6 + sx, by, FT, 0.08, 1.1, 0.86, METAL)
        c.box(f"Bench_{i}_Shelf", cx - 0.6, by, FT + 0.25, 3.2, 1.0, 0.04, WOOD)
        for k, sx in enumerate([-1.1, 0.4]):
            c.cyl(f"Stool_{i}_{k}", cx - 0.6 + sx, by - 1.0, FT, 0.18, 0.6, DARK)
    z = FT + 0.93
    b = y0 + 4.0  # bench 0: disassembled computer and tools
    c.box("OpenPC_Base", cx - 1.6, b, z, 0.45, 0.5, 0.02, DARK)
    c.box("OpenPC_Back", cx - 1.6, b + 0.24, z, 0.45, 0.02, 0.45, DARK)
    c.box("OpenPC_Top", cx - 1.6, b, z + 0.45, 0.45, 0.5, 0.02, DARK)
    c.box("Loose_GPU", cx - 0.9, b - 0.1, z, 0.3, 0.12, 0.05, GREEN)
    c.box("Loose_PSU", cx - 0.9, b + 0.3, z, 0.18, 0.16, 0.09, METAL)
    c.cyl("Loose_Fan_A", cx - 0.5, b + 0.1, z, 0.07, 0.03, DARK)
    c.cyl("Loose_Fan_B", cx - 0.3, b - 0.2, z, 0.07, 0.03, DARK)
    c.box("Motherboard", cx - 0.1, b + 0.25, z, 0.3, 0.26, 0.012, GREEN)
    c.box("Toolbox", cx + 0.6, b + 0.2, z, 0.5, 0.22, 0.2, RED)
    for i in range(5):
        c.box(f"Tool_{i}", cx + 0.3 + i * 0.12, b - 0.3, z, 0.03, 0.24, 0.02, ORANGE if i % 2 else METAL)
    c.box("OldController", cx + 1.0, b - 0.25, z, 0.16, 0.1, 0.04, FABRIC)
    b = y0 + 8.2  # bench 1: electronics kits and soldering station
    c.box("SolderStation_Base", cx - 1.7, b, z, 0.2, 0.16, 0.12, BLUE)
    c.cyl("SolderStation_Iron", cx - 1.45, b, z, 0.012, 0.2, METAL)
    c.box("SolderMat", cx - 1.1, b, z, 0.5, 0.35, 0.005, BLUE)
    for i, m in enumerate([RED, YELLOW, BLUE, GREEN, ORANGE]):
        c.box(f"ElectronicsKit_{i}", cx - 0.2 + (i % 3) * 0.38, b + 0.25 - (i // 3) * 0.4, z, 0.32, 0.24, 0.1, m)
    c.box("Multimeter", cx + 1.0, b - 0.3, z, 0.09, 0.16, 0.04, YELLOW)
    # 3D printing area on the right wall
    c.box("PrintCounter", x1 - T - 0.4, y0 + 6.0, FT, 0.8, 4.2, 0.9, WOOD)
    for i, py in enumerate([y0 + 4.8, y0 + 6.2, y0 + 7.4]):
        g = c.grp(f"Printer3D_{i + 1}", x1 - T - 0.4, py, 0, FT + 0.9)
        g.box("Base", 0, 0, 0, 0.5, 0.5, 0.08, DARK)
        g.box("PostL", -0.22, 0, 0.08, 0.04, 0.04, 0.5, METAL)
        g.box("PostR", 0.22, 0, 0.08, 0.04, 0.04, 0.5, METAL)
        g.box("Gantry", 0, 0, 0.56, 0.5, 0.05, 0.04, METAL)
        g.box("Bed", 0, 0, 0.1, 0.32, 0.32, 0.01, STEEL)
        g.box("Print", 0, 0, 0.11, 0.08, 0.08, 0.07 + i * 0.04, ORANGE)
    for i in range(4):
        c.cyl(f"FilamentSpool_{i}", x1 - T - 0.4, y0 + 8.6 + i * 0.12, FT + 0.9, 0.1, 0.07, [RED, WHITE, BLUE, GOLD][i], "Y")
    for i in range(4):  # storage cabinets (still empty in Episode 100)
        cabinet(c, f"StorageCabinet_{i + 1}", x0 + T + 0.3, y0 + 2.2 + i * 1.25, 0.6, 1.2, 2.0, WHITE)
    c.box("Pegboard", x0 + T + 0.03, y0 + 9.6, FT + 1.1, 0.03, 3.0, 1.1, WOOD)
    text(c.coll, "Maker_Sign", "MAKER LAB", cx, y1 - T - 0.02, FT + 2.6, 0.34, INK, upright=True)
    pendants(c, x0, y0, x1, y1, 2, 2)
    label("Commons_Maker_Lab", cx, y0 + 11.6, 1.0)

    # Music Room
    c, x0, y0, x1, y1 = build_room("Commons_Music_Room")
    cx = (x0 + x1) / 2
    for i in range(8):  # acoustic treatment
        m = ACOUSTIC if i % 2 else ACOUSTIC2
        c.box(f"AcousticPanel_W{i}", x0 + T + 0.04, y0 + 1.2 + i * 1.45, FT + 0.9, 0.07, 1.1, 1.5, m)
        c.box(f"AcousticPanel_E{i}", x1 - T - 0.04, y0 + 1.2 + i * 1.45, FT + 0.9, 0.07, 1.1, 1.5, m)
    for i in range(5):
        c.box(f"AcousticPanel_N{i}", x0 + 1.0 + i * 1.5, y1 - T - 0.04, FT + 0.9, 1.1, 0.07, 1.5, ACOUSTIC2 if i % 2 else ACOUSTIC)
    c.box("Rug", cx, y0 + 6.5, FT, 5.6, 7.5, 0.012, FABRIC_W)
    p = c.grp("DigitalPiano_Large", cx - 1.2, y1 - 1.3, 0)
    p.box("Body", 0, 0, 0.72, 1.5, 0.5, 0.16, BLACK)
    p.box("Keys", 0, -0.14, 0.80, 1.36, 0.16, 0.085, WHITE)
    p.box("LegL", -0.7, 0, 0, 0.06, 0.44, 0.72, BLACK)
    p.box("LegR", 0.7, 0, 0, 0.06, 0.44, 0.72, BLACK)
    p.box("MusicRest", 0, 0.18, 0.88, 0.7, 0.02, 0.24, BLACK)
    p.box("Bench", 0, -0.75, 0, 0.9, 0.36, 0.48, FABRIC_D)
    def guitar(n, x, y, body, long=False):
        g = c.grp(n, x, y, 0)
        g.cyl("StandBase", 0, 0, 0, 0.2, 0.03, DARK)
        g.box("Body", 0, 0, 0.12, 0.36, 0.07, 0.46, body)
        g.box("Neck", 0, 0, 0.58, 0.06, 0.04, 0.72 if long else 0.6, WOOD_D)
        g.box("Head", 0, 0, 1.30 if long else 1.18, 0.09, 0.03, 0.16, body)
    guitar("Guitar_1", x1 - 1.0, y1 - 1.0, RED)
    guitar("Guitar_2", x1 - 1.7, y1 - 1.0, WOOD)
    guitar("Bass", x1 - 2.4, y1 - 1.0, BLUE, True)
    c.box("Amp_Guitar", x1 - 1.0, y1 - 2.2, FT, 0.6, 0.3, 0.5, DARK)
    c.box("Amp_Bass", x1 - 2.2, y1 - 2.2, FT, 0.6, 0.35, 0.65, DARK)
    d = c.grp("ElectronicDrumKit", cx + 1.2, y0 + 5.2, 160)
    for i, (px, py, pz, r) in enumerate([(-0.45, 0.2, 0.75, 0.15), (0, 0.38, 0.85, 0.13), (0.42, 0.3, 0.85, 0.13), (0.7, -0.1, 0.7, 0.16)]):
        d.cyl(f"Pad_{i}", px, py, pz, r, 0.05, DARK)
        d.cyl(f"PadPost_{i}", px, py, 0, 0.015, pz, METAL)
    for i, (px, py) in enumerate([(-0.75, 0.45), (0.75, 0.55)]):
        d.cyl(f"CymbalPad_{i}", px, py, 1.1, 0.18, 0.012, DARK)
        d.cyl(f"CymbalPost_{i}", px, py, 0, 0.012, 1.1, METAL)
    d.box("KickPad", 0, 0.3, 0, 0.3, 0.1, 0.42, DARK)
    d.box("Module", -0.75, 0.1, 0.95, 0.24, 0.1, 0.14, DARK)
    d.cyl("Throne", 0, -0.45, 0, 0.17, 0.5, FABRIC_D)
    for i, (mx, my) in enumerate([(cx - 0.6, y0 + 7.4), (cx + 0.3, y0 + 8.2)]):  # "microfones": count not stated
        g = c.grp(f"Microphone_{i + 1}", mx, my, 0)
        g.cyl("Base", 0, 0, 0, 0.16, 0.02, DARK)
        g.cyl("Stand", 0, 0, 0, 0.012, 1.45, METAL)
        g.sph("Capsule", 0, 0, 1.5, 0.08, STEEL, 1.5)
    r = c.grp("RecordingDesk_Small", x0 + 1.3, y0 + 2.6, 90)
    r.box("Desk", 0, 0, 0.70, 1.5, 0.7, 0.04, WOOD_D)
    r.box("LegL", -0.7, 0, 0, 0.05, 0.6, 0.7, METAL)
    r.box("LegR", 0.7, 0, 0, 0.05, 0.6, 0.7, METAL)
    r.box("Mixer", 0, -0.05, 0.74, 0.5, 0.32, 0.05, DARK)
    r.box("Screen", 0, 0.25, 0.86, 0.56, 0.03, 0.32, SCREEN)
    r.box("SpeakerL", -0.55, 0.2, 0.74, 0.18, 0.2, 0.28, DARK)
    r.box("SpeakerR", 0.55, 0.2, 0.74, 0.18, 0.2, 0.28, DARK)
    chair(r, 0, -0.7)
    pendants(c, x0, y0, x1, y1, 1, 2)
    label("Commons_Music_Room", cx, y0 + 10.2, 0.9)

    # Photo & Film (no large Kairos logo, Episode 100)
    c, x0, y0, x1, y1 = build_room("Commons_Photo_Film")
    cx = (x0 + x1) / 2
    c.box("Backdrop_Wall", cx - 0.6, y1 - T - 0.08, FT, 3.6, 0.04, 2.7, BACKDROP)
    c.box("Backdrop_Floor", cx - 0.6, y1 - 1.6, FT, 3.6, 3.0, 0.015, BACKDROP)
    c.cyl("Backdrop_Stool", cx - 0.6, y1 - 1.6, FT + 0.015, 0.17, 0.5, WOOD)
    for i, (lx, ly, rot) in enumerate([(cx - 2.6, y1 - 3.6, -35), (cx + 1.4, y1 - 3.6, 35)]):
        g = c.grp(f"Softbox_{i + 1}", lx, ly, rot)
        g.cyl("Base", 0, 0, 0, 0.25, 0.02, DARK)
        g.cyl("Stand", 0, 0, 0, 0.015, 1.7, METAL)
        g.box("Box", 0, 0.1, 1.5, 0.7, 0.3, 0.7, DARK)
        g.box("Diffuser", 0, 0.26, 1.53, 0.64, 0.01, 0.64, SOFTBOX)
    def camera_rig(n, x, y, rot):
        g = c.grp(n, x, y, rot)
        for k, (dx, dy) in enumerate([(0.25, -0.15), (-0.25, -0.15), (0, 0.28)]):
            g.cyl(f"TripodFoot_{k}", dx, dy, 0, 0.02, 0.02, DARK)
        g.cyl("Tripod", 0, 0, 0, 0.02, 1.35, DARK)
        g.box("Body", 0, 0, 1.35, 0.15, 0.1, 0.11, DARK)
        g.cyl("Lens", 0, 0.14, 1.36, 0.045, 0.18, DARK, "Y")
    camera_rig("Camera_1", cx - 0.6, y1 - 5.0, 0)
    camera_rig("Camera_2", cx + 1.6, y1 - 5.6, 20)
    c.box("LensShelf", x0 + T + 0.2, y0 + 6.0, FT + 1.0, 0.35, 2.4, 0.04, WOOD)
    c.box("LensShelf_Low", x0 + T + 0.2, y0 + 6.0, FT, 0.4, 2.4, 0.8, WOOD)
    for i in range(6):
        c.cyl(f"Lens_{i + 1}", x0 + T + 0.2, y0 + 5.0 + i * 0.4, FT + 1.04, 0.05 + (i % 3) * 0.008, 0.1 + (i % 2) * 0.06, DARK)
    c.box("SpareCameraBody", x0 + T + 0.2, y0 + 5.6, FT + 0.8, 0.14, 0.1, 0.1, DARK)
    workstation(c, "EditingStation_1", x1 - 1.0, y0 + 2.2, -90, METAL, False)
    workstation(c, "EditingStation_2", x1 - 1.0, y0 + 4.4, -90, METAL, False)
    c.box("LightStand_Spare", x0 + 0.8, y0 + 1.0, FT, 0.3, 0.3, 1.2, DARK)
    pendants(c, x0, y0, x1, y1, 1, 2)
    label("Commons_Photo_Film", cx, y0 + 7.6, 0.9)

    # Kitchen Studio (much smaller than the professional dining kitchen)
    c, x0, y0, x1, y1 = build_room("Commons_Kitchen_Studio")
    cx = (x0 + x1) / 2
    wx = x0 + T + 0.33
    c.box("Counter_Base", wx, y0 + 6.5, FT, 0.62, 8.0, 0.86, WOOD_D)
    c.box("Counter_Top", wx, y0 + 6.5, FT + 0.86, 0.66, 8.0, 0.04, WHITE)
    c.box("Stove", wx, y0 + 6.0, FT + 0.9, 0.58, 0.7, 0.02, DARK)
    for i, (dx, dy) in enumerate([(-0.14, -0.17), (0.14, -0.17), (-0.14, 0.17), (0.14, 0.17)]):
        c.cyl(f"Burner_{i}", wx + dx, y0 + 6.0 + dy, FT + 0.92, 0.09, 0.012, STEEL)
    c.cyl("Pan", wx - 0.14, y0 + 5.83, FT + 0.932, 0.12, 0.05, DARK)
    c.box("Oven", wx, y0 + 6.0, FT + 0.12, 0.64, 0.62, 0.62, STEEL)
    c.box("Oven_Door", wx + 0.325, y0 + 6.0, FT + 0.2, 0.01, 0.5, 0.42, DARK)
    c.box("Hood", wx, y0 + 6.0, FT + 1.9, 0.5, 0.8, 0.3, STEEL)
    c.box("Sink", wx, y0 + 8.4, FT + 0.905, 0.42, 0.7, 0.01, STEEL)
    c.cyl("Faucet", wx - 0.2, y0 + 8.4, FT + 0.9, 0.02, 0.3, STEEL)
    c.box("Refrigerator", wx + 0.05, y0 + 11.6, FT, 0.75, 0.9, 1.95, STEEL)
    c.box("Refrigerator_Handle", wx + 0.44, y0 + 11.3, FT + 0.8, 0.03, 0.03, 0.7, DARK)
    for i in range(3):
        c.box(f"WallCabinet_{i}", wx - 0.1, y0 + 3.0 + i * 0.95 if i < 2 else y0 + 9.4, FT + 1.5, 0.4, 0.9, 0.7, WOOD_D)
    for i in range(3):
        c.cyl(f"UtensilCrock_{i}", wx - 0.1, y0 + 4.2 + i * 0.3, FT + 0.9, 0.06, 0.16, [WHITE, RED, STEEL][i])
    c.box("CuttingBoard", wx + 0.05, y0 + 3.2, FT + 0.9, 0.3, 0.42, 0.02, WOOD)
    c.box("Island_Base", cx + 1.0, y0 + 6.0, FT, 0.9, 2.6, 0.86, WOOD_D)
    c.box("Island_Top", cx + 1.0, y0 + 6.0, FT + 0.86, 1.0, 2.8, 0.04, WOOD)
    c.cyl("MixingBowl", cx + 1.0, y0 + 6.5, FT + 0.9, 0.14, 0.1, WHITE)
    c.cyl("Pot", cx + 0.9, y0 + 5.5, FT + 0.9, 0.12, 0.14, STEEL)
    for i in range(3):
        c.cyl(f"Stool_{i}", cx + 1.85, y0 + 5.1 + i * 0.9, FT, 0.17, 0.62, WOOD)
    cabinet(c, "Pantry", x1 - T - 0.3, y0 + 10.6, 0.55, 1.6, 2.0, WOOD_D)
    pendants(c, x0, y0, x1, y1, 1, 2)
    label("Commons_Kitchen_Studio", cx + 0.3, y0 + 9.0, 0.75)

    # Kairos Community (small, office-like, whiteboard)
    c, x0, y0, x1, y1 = build_room("Commons_Kairos_Community")
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    table_chairs(c, "Table", cx, cy - 0.3, 2.2, 1.0, 2, WOOD)
    whiteboard(c, "Whiteboard", cx - 0.9, y1 - T - 0.05, "N", 2.0)
    text(c.coll, "Community_Sign", "KAIROS\nCOMMUNITY", cx + 1.55, y1 - T - 0.02, FT + 1.75, 0.2, INK, upright=True)
    c.box("LowShelf", x0 + T + 0.25, y0 + 1.4, FT, 0.4, 1.6, 0.8, WOOD)
    plant(c, "Plant", x1 - 0.8, y1 - 0.8, 0.8)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Commons_Kairos_Community", cx, y0 + 1.3, 0.72)
commons()
L.rect("Commons_Dining_Covered_Link_Proposed", LAY["commons_dining_link"], 0, 0.05, PLAZA)

# ---------------------------------------------------------------- 04 Dining
def dining():
    c, x0, y0, x1, y1 = build_room("Dining_Main_Hall")
    for i in range(3):          # table count is illustrative, not a capacity
        for j in range(3):
            table_chairs(c, f"Table_{i}_{j}", x0 + 3.4 + i * 4.6, y0 + 4.6 + j * 5.4 + (1.5 if j else 0), 2.6, 0.9, 3, WOOD)
    c.box("ServingCounter", x1 - 1.3, 29, FT, 0.8, 5.2, 0.9, STEEL)
    c.box("ServingCounter_Guard", x1 - 1.3, 29, FT + 1.2, 0.5, 5.0, 0.03, GLASS)
    c.box("TrayStation", x1 - 1.3, 34.2, FT, 0.8, 1.6, 0.9, WOOD)
    c.box("DrinkStation", x0 + 0.6, y1 - 3.2, FT, 0.7, 2.4, 0.9, WOOD_D)
    plant(c, "Plant_A", x0 + 0.9, y0 + 0.9, 1.3)
    plant(c, "Plant_B", x1 - 0.9, y0 + 0.9, 1.3)
    pendants(c, x0, y0, x1, y1, 3, 3)
    label("Dining_Main_Hall", (x0 + x1) / 2 - 1, y0 + 7.4, 1.3)
    c, x0, y0, x1, y1 = build_room("Dining_Professional_Kitchen")
    cx = (x0 + x1) / 2
    for i in range(3):
        c.box(f"PrepTable_{i}", cx - 1.0, y0 + 6.5 + i * 4.6, FT + 0.0, 2.6, 1.0, 0.9, STEEL)
    c.box("CookLine", x1 - T - 0.45, y0 + 13.0, FT, 0.85, 9.0, 0.9, STEEL)
    for i in range(6):
        c.cyl(f"CookLine_Burner_{i}", x1 - T - 0.45, y0 + 9.4 + i * 0.7, FT + 0.9, 0.12, 0.015, DARK)
    c.box("CookLine_Hood", x1 - T - 0.5, y0 + 13.0, FT + 2.0, 1.0, 9.0, 0.35, STEEL)
    c.box("ColdRoom", x1 - 2.0, y1 - 2.0, FT, 3.4, 3.4, 2.5, WHITE)
    c.box("ColdRoom_Door", x1 - 2.6, y1 - 3.72, FT, 1.0, 0.04, 2.1, STEEL)
    c.box("DishArea", x0 + T + 0.45, y0 + 2.6, FT, 0.8, 3.2, 0.9, STEEL)
    for i in range(3):
        c.box(f"ShelfRack_{i}", cx - 3.0 + i * 1.6, y1 - 0.6, FT, 1.4, 0.5, 1.9, METAL)
    pendants(c, x0, y0, x1, y1, 2, 3)
    label("Dining_Professional_Kitchen", cx - 1.0, y0 + 3.8, 0.9)
dining()

# ---------------------------------------------------------------- 08 Administration and media
def admin():
    c, x0, y0, x1, y1 = build_room("Admin_Adrian_Office")
    cx = (x0 + x1) / 2
    workstation(c, "Desk", cx, y1 - 2.4, 180, METAL, False)
    seat(c, "GuestChair_A", cx - 0.6, y1 - 4.2, 0, 1, FABRIC_D)
    seat(c, "GuestChair_B", cx + 0.6, y1 - 4.2, 0, 1, FABRIC_D)
    sofa(c, "Sofa", x0 + 1.0, y0 + 3.0, -90, 2.0, FABRIC_W)
    cabinet(c, "Shelf", x1 - T - 0.25, y0 + 4.5, 0.4, 2.8, 1.8, WOOD_D)
    plant(c, "Plant", x1 - 0.8, y0 + 0.8)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Admin_Adrian_Office", cx, y0 + 1.6, 0.8)
    c, x0, y0, x1, y1 = build_room("Admin_Meeting")
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    table_chairs(c, "MeetingTable", cx, cy + 0.6, 4.6, 1.4, 4, WOOD_D)
    wall_screen(c, "Screen", x1 - T - 0.06, cy + 0.6, "E", 2.2)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Admin_Meeting", cx, y0 + 1.6, 0.8)
    c, x0, y0, x1, y1 = build_room("Admin_Media_Interview")
    cx = (x0 + x1) / 2
    c.box("Backdrop", cx, y1 - T - 0.08, FT, 4.0, 0.04, 2.6, FABRIC_D)
    seat(c, "InterviewChair_A", cx - 0.8, y1 - 1.8, 0, -1, FABRIC_W)
    seat(c, "InterviewChair_B", cx + 0.8, y1 - 1.8, 0, -1, FABRIC_W)
    c.cyl("Tripod", cx, y1 - 5.0, FT, 0.02, 1.35, DARK)
    c.box("Camera", cx, y1 - 5.0, FT + 1.35, 0.15, 0.2, 0.11, DARK)
    for i, lx in enumerate([cx - 2.4, cx + 2.4]):
        c.cyl(f"LightStand_{i}", lx, y1 - 4.0, FT, 0.015, 1.7, METAL)
        c.box(f"LightPanel_{i}", lx, y1 - 4.0, FT + 1.5, 0.6, 0.08, 0.5, SOFTBOX)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Admin_Media_Interview", cx, y0 + 1.6, 0.8)
    c, x0, y0, x1, y1 = build_room("Admin_Operations")
    for i in range(6):          # desk count illustrative
        workstation(c, f"Desk_{i + 1}", x0 + 3.2 + i * 3.6, y0 + 1.9, 180, METAL, False)
    c.box("PrintStation", x1 - 1.4, y1 - 0.7, FT, 1.6, 0.6, 0.9, WOOD)
    plant(c, "Plant", x0 + 0.8, y1 - 0.8)
    pendants(c, x0, y0, x1, y1, 4, 1)
    label("Admin_Operations", (x0 + x1) / 2, y1 - 1.5, 0.9)
    circulation("Admin_Entry_Circulation", [(15, 24.5), (33, 24.5)])
admin()

# ---------------------------------------------------------------- 05 Recreation Center (Episode 86)
def hoop(c, n, x, y, dx, dy=0):
    """Hoop at (x, y); board faces (dx, dy)."""
    c.cyl(n + "_Post", x - dx * 0.9, y - dy * 0.9, 0, 0.07, 3.0, METAL)
    c.box(n + "_Arm", x - dx * 0.45, y - dy * 0.45, 2.85, 0.9 if dx else 0.08, 0.9 if dy else 0.08, 0.08, METAL)
    c.box(n + "_Board", x, y, 2.5, 0.05 if dx else 1.5, 0.05 if dy else 1.5, 0.95, WHITE)
    c.cyl(n + "_Rim", x + dx * 0.3, y + dy * 0.3, 2.62, 0.23, 0.025, ORANGE)
    c.cyl(n + "_RimInner", x + dx * 0.3, y + dy * 0.3, 2.615, 0.2, 0.035, DARK)

def goal(c, n, x, y, dx, w=3.0):
    for k, sy in (("L", -w / 2), ("R", w / 2)):
        c.box(f"{n}_Post{k}", x, y + sy, 0.1, 0.08, 0.08, 2.0, WHITE)
        c.box(f"{n}_Side{k}", x - dx * 0.5, y + sy, 0.1, 1.0, 0.04, 0.04, WHITE)
    c.box(n + "_Bar", x, y, 2.06, 0.08, w + 0.08, 0.08, WHITE)
    c.box(n + "_BackBar", x - dx * 1.0, y, 0.1, 0.04, w, 0.04, WHITE)

def court_lines(c, n, r, z, m, w=0.08, mid=True):
    x0, y0, x1, y1 = r
    c.box(n + "_S", (x0 + x1) / 2, y0, z, x1 - x0, w, 0.006, m)
    c.box(n + "_N", (x0 + x1) / 2, y1, z, x1 - x0, w, 0.006, m)
    c.box(n + "_W", x0, (y0 + y1) / 2, z, w, y1 - y0, 0.006, m)
    c.box(n + "_E", x1, (y0 + y1) / 2, z, w, y1 - y0, 0.006, m)
    if mid:
        c.box(n + "_Mid", (x0 + x1) / 2, (y0 + y1) / 2, z, w, y1 - y0, 0.006, m)

def recreation():
    c, x0, y0, x1, y1 = build_room("Recreation_Indoor_Multipurpose_Court")
    ct = [-20.5, -58, 3.5, -42]           # schematic court extent
    cx, cy = (ct[0] + ct[2]) / 2, (ct[1] + ct[3]) / 2
    c.rect("Court_Surface", [ct[0] - 1, ct[1] - 1.5, ct[2] + 1, ct[3] + 1.5], FT, 0.02, COURT_IN)
    z = FT + 0.02
    court_lines(c, "BasketballLines", ct, z, WHITE)
    c.cyl("CenterCircle", cx, cy, z, 1.8, 0.004, WHITE)
    c.cyl("CenterCircle_Fill", cx, cy, z, 1.72, 0.006, COURT_IN)
    for k, sx in (("W", ct[0]), ("E", ct[2])):
        d = 1 if k == "W" else -1
        court_lines(c, f"Key_{k}", [min(sx, sx + d * 5.2), cy - 2.2, max(sx, sx + d * 5.2), cy + 2.2], z, WHITE, 0.07, False)
        hoop(c, f"Hoop_{k}", sx + d * 0.4, cy, d)
        goal(c, f"FutsalGoal_{k}", sx - d * 0.05, cy, d)
    court_lines(c, "FutsalLines", [ct[0] + 0.4, ct[1] + 0.5, ct[2] - 0.4, ct[3] - 0.5], z + 0.001, YELLOW, 0.07)
    court_lines(c, "VolleyballLines", [cx - 8, cy - 4, cx + 8, cy + 4], z + 0.002, BLUE, 0.07)
    for k, sy in (("S", cy - 4.6), ("N", cy + 4.6)):
        c.cyl(f"VolleyballPostSleeve_{k}", cx, sy, z, 0.09, 0.01, METAL)
    g = c.grp("VolleyballNetCart_Movable", ct[0] + 3.0, y0 + 1.2, 0)
    g.box("Cart", 0, 0, 0.1, 2.8, 0.6, 0.3, METAL)
    g.cyl("PostA", 0, -0.12, 0.4, 0.05, 2.5, METAL, "X")
    g.cyl("PostB", 0, 0.12, 0.4, 0.05, 2.5, METAL, "X")
    g.cyl("RolledNet", 0, 0, 0.52, 0.12, 2.2, WHITE, "X")
    g = c.grp("BallRack", ct[2] - 2.0, y0 + 1.0, 0)
    g.box("Frame", 0, 0, 0, 1.6, 0.5, 0.5, METAL)
    for i, m in enumerate([ORANGE, ORANGE, WHITE, YELLOW]):
        g.sph(f"Ball_{i}", -0.6 + i * 0.4, 0, 0.62, 0.24, m)
    for i, bx in enumerate([cx - 5, cx + 5]):       # low team benches, not spectator seating
        c.box(f"PlayerBench_{i}", bx, y1 - 0.8, FT, 2.4, 0.4, 0.45, WOOD)
    pendants(c, x0, y0, x1, y1, 5, 3)
    label("Recreation_Indoor_Multipurpose_Court", cx, cy + 5.6, 1.25)

    c, x0, y0, x1, y1 = build_room("Recreation_Table_Tennis")
    cx = (x0 + x1) / 2
    for i, ty in enumerate([y0 + 2.6, y0 + 7.4]):   # exactly two (Episode 86)
        g = c.grp(f"TableTennis_Table_{i + 1}", cx, ty, 0)
        g.box("Top", 0, 0, 0.72, 2.74, 1.52, 0.04, BLUE)
        g.box("CenterLine", 0, 0, 0.761, 2.74, 0.02, 0.002, WHITE)
        g.box("Net", 0, 0, 0.76, 0.02, 1.7, 0.15, WHITE)
        for k, (lx, ly) in enumerate([(-1.1, -0.55), (1.1, -0.55), (-1.1, 0.55), (1.1, 0.55)]):
            g.box(f"Leg_{k}", lx, ly, 0, 0.05, 0.05, 0.72, METAL)
        g.box("Paddle_A", -0.8, 0.3, 0.762, 0.15, 0.16, 0.012, RED)
        g.box("Paddle_B", 0.8, -0.3, 0.762, 0.15, 0.16, 0.012, BLACK)
    label("Recreation_Table_Tennis", cx, y0 + 5.0, 0.72)

    c, x0, y0, x1, y1 = build_room("Recreation_Mobility_Area")
    cx = (x0 + x1) / 2
    for i in range(4):
        c.box(f"Mat_{i}", x0 + 1.3 + i * 1.75, y0 + 3.0, FT + 0.012, 0.7, 1.9, 0.03, [BLUE, GREEN, ZF["commons"], ORANGE][i])
    for i in range(3):
        c.cyl(f"FoamRoller_{i}", x0 + 1.5 + i * 0.5, y0 + 5.2, FT + 0.012, 0.08, 0.45, [BLUE, DARK, ORANGE][i], "Y")
    c.sph("ExerciseBall_A", x1 - 1.2, y0 + 6.0, FT + 0.33, 0.65, RED)
    c.sph("ExerciseBall_B", x1 - 2.2, y0 + 6.6, FT + 0.28, 0.55, BLUE)
    c.box("StretchBench", cx - 1.5, y1 - 2.6, FT, 1.8, 0.5, 0.42, FABRIC_D)
    for i in range(3):
        c.box(f"WallBars_{i}", x0 + 2.0 + i * 1.0, y1 - 0.5, FT, 0.9, 0.08, 2.4, WOOD)
    c.box("Mirror", x1 - 0.5, (y0 + y1) / 2 + 1.0, FT + 0.3, 0.03, 4.0, 1.9, GLASS)
    label("Recreation_Mobility_Area", cx, y0 + 8.4, 0.72)

    c, x0, y0, x1, y1 = build_room("Recreation_Gym_Connection")
    label("Recreation_Gym_Connection", (x0 + x1) / 2, (y0 + y1) / 2, 0.6)
recreation()

# ---------------------------------------------------------------- 06 Performance and health
def performance():
    c, x0, y0, x1, y1 = build_room("Performance_Gym")
    c.rect("RubberFloor", [x0 + 0.4, y0 + 0.4, x1 - 0.4, y1 - 0.4], FT, 0.012, RUBBER)
    for i in range(2):
        g = c.grp(f"PowerRack_{i + 1}", x0 + 3.0 + i * 4.0, y1 - 2.4, 0)
        for k, (px, py) in enumerate([(-0.65, -0.65), (0.65, -0.65), (-0.65, 0.65), (0.65, 0.65)]):
            g.box(f"Post_{k}", px, py, 0, 0.08, 0.08, 2.3, DARK)
        g.box("TopA", 0, -0.65, 2.3, 1.38, 0.08, 0.08, DARK)
        g.box("TopB", 0, 0.65, 2.3, 1.38, 0.08, 0.08, DARK)
        g.cyl("Bar", 0, -0.7, 1.3, 0.02, 2.1, STEEL, "X")
        g.cyl("PlateL", -0.9, -0.7, 1.1, 0.22, 0.08, DARK, "X")
        g.cyl("PlateR", 0.9, -0.7, 1.1, 0.22, 0.08, DARK, "X")
        g.box("Bench", 0, -1.6, 0.3, 0.32, 1.3, 0.14, FABRIC_D)
        g.box("BenchLeg", 0, -1.6, 0, 0.2, 1.0, 0.3, METAL)
    c.box("DumbbellRack", x1 - 0.7, y1 - 6.0, FT, 0.6, 3.4, 0.9, METAL)
    for i in range(7):
        c.cyl(f"Dumbbell_{i}", x1 - 0.7, y1 - 7.5 + i * 0.5, FT + 0.9, 0.08, 0.36, DARK, "X")
    for i in range(3):
        g = c.grp(f"Treadmill_{i + 1}", x0 + 2.5 + i * 2.2, y0 + 3.0, 180)
        g.box("Deck", 0, 0, 0.1, 0.8, 1.9, 0.14, DARK)
        g.box("PostL", -0.35, 0.8, 0.24, 0.05, 0.05, 1.1, METAL)
        g.box("PostR", 0.35, 0.8, 0.24, 0.05, 0.05, 1.1, METAL)
        g.box("Console", 0, 0.8, 1.3, 0.75, 0.1, 0.3, SCREEN)
    for i in range(2):
        g = c.grp(f"Bike_{i + 1}", x1 - 3.4 + i * 1.6, y0 + 2.6, 180)
        g.box("Frame", 0, 0, 0.1, 0.25, 1.1, 0.5, DARK)
        g.cyl("Flywheel", 0, 0.35, 0.15, 0.26, 0.08, STEEL, "X")
        g.box("Seat", 0, -0.35, 0.95, 0.24, 0.3, 0.07, DARK)
        g.box("SeatPost", 0, -0.35, 0.6, 0.05, 0.05, 0.35, METAL)
        g.box("Handle", 0, 0.5, 0.6, 0.5, 0.05, 0.5, METAL)
    c.box("CableMachine", x0 + 0.9, (y0 + y1) / 2 + 5.0, FT, 0.9, 2.6, 2.2, DARK)
    c.box("FunctionalMat", (x0 + x1) / 2 + 1.5, (y0 + y1) / 2 - 5.0, FT + 0.012, 6.0, 4.0, 0.02, ZF["recreation"])
    c.cyl("Kettlebell_A", (x0 + x1) / 2 - 0.5, (y0 + y1) / 2 - 6.0, FT + 0.03, 0.12, 0.2, DARK)
    c.cyl("Kettlebell_B", (x0 + x1) / 2, (y0 + y1) / 2 - 6.2, FT + 0.03, 0.14, 0.24, DARK)
    c.box("Mirror", x1 - T - 0.03, (y0 + y1) / 2 + 9, FT + 0.3, 0.03, 5.0, 2.0, GLASS)
    pendants(c, x0, y0, x1, y1, 2, 4)
    label("Performance_Gym", (x0 + x1) / 2, (y0 + y1) / 2 + 3.0, 1.1)

    c, x0, y0, x1, y1 = build_room("Health_Physiotherapy")
    for i in range(2):
        c.box(f"TreatmentTable_{i}_Top", x0 + 3.2 + i * 3.4, y0 + 3.6, FT + 0.6, 0.75, 2.0, 0.1, FABRIC)
        c.box(f"TreatmentTable_{i}_Base", x0 + 3.2 + i * 3.4, y0 + 3.6, FT, 0.5, 1.5, 0.6, METAL)
        c.cyl(f"Stool_{i}", x0 + 4.2 + i * 3.4, y0 + 3.0, FT, 0.17, 0.5, DARK)
    cabinet(c, "SupplyCabinet", x1 - 1.2, y1 - T - 0.3, 1.8, 0.45, 1.9, WHITE)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Health_Physiotherapy", (x0 + x1) / 2, y0 + 1.2, 0.72)
    c, x0, y0, x1, y1 = build_room("Health_Nutrition_Performance")
    workstation(c, "Desk", x1 - 2.6, y0 + 4.6, 180, METAL, False)
    seat(c, "Chair_A", x1 - 3.1, y0 + 2.9, 0, 1, FABRIC_D)
    seat(c, "Chair_B", x1 - 2.1, y0 + 2.9, 0, 1, FABRIC_D)
    table_chairs(c, "SmallTable", x0 + 2.8, y0 + 3.6, 1.6, 0.9, 1, WOOD)
    whiteboard(c, "Whiteboard", x0 + 4.0, y1 - T - 0.05, "N", 2.0)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Health_Nutrition_Performance", (x0 + x1) / 2 - 1.5, y0 + 1.2, 0.72)
    c, x0, y0, x1, y1 = build_room("Health_Psychology")   # private: no windows, no names
    sofa(c, "Sofa", x0 + 3.2, y1 - 1.0, 0, 2.0, FABRIC_W)
    sofa(c, "Armchair_A", x0 + 2.4, y0 + 3.0, 180, 0.95, FABRIC)
    sofa(c, "Armchair_B", x0 + 4.2, y0 + 3.0, 180, 0.95, FABRIC)
    c.cyl("SideTable", x0 + 3.3, y0 + 4.3, FT, 0.3, 0.45, WOOD)
    c.box("Rug", x0 + 3.3, y0 + 4.2, FT, 3.6, 3.2, 0.012, FABRIC_W)
    workstation(c, "Desk", x1 - 1.6, y0 + 3.5, -90, METAL, False)
    plant(c, "Plant", x0 + 0.8, y0 + 0.8)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Health_Psychology", (x0 + x1) / 2 + 1.6, y0 + 1.2, 0.72)
    c, x0, y0, x1, y1 = build_room("Health_Medical_Support")
    c.box("ExamTable_Top", x0 + 3.0, y1 - 1.4, FT + 0.6, 2.0, 0.75, 0.1, FABRIC)
    c.box("ExamTable_Base", x0 + 3.0, y1 - 1.4, FT, 1.5, 0.5, 0.6, METAL)
    workstation(c, "Desk", x1 - 2.6, y0 + 2.4, 0, METAL, False)
    c.box("SinkCounter", x0 + 2.0, y0 + T + 0.35, FT, 2.4, 0.6, 0.9, WHITE)
    cabinet(c, "Cabinet", x0 + 4.4, y0 + T + 0.3, 1.2, 0.45, 1.9, WHITE)
    pendants(c, x0, y0, x1, y1, 1, 1)
    label("Health_Medical_Support", (x0 + x1) / 2, y0 + 4.6, 0.72)
    circulation("Performance_Circulation", [])
    for i, by in enumerate([-40, -47, -61]):
        ROOTC = Ctx(ROOT["Performance_Circulation"].users_collection[0], ROOT["Performance_Circulation"], "Performance_Circulation_")
        ROOTC.box(f"WaitBench_{i}", 38.5, by, FT, 0.45, 1.6, 0.45, WOOD)
performance()

# ---------------------------------------------------------------- 07 Residential (closed massing only)
def residential():
    c = room_root("Residential_General_Accommodation")
    ROOT["Residential_General_Accommodation"].location = (-52, -50, 0)
    for i, r in enumerate(LAY["residential_masses"]):
        c.rect(f"Mass_{i + 1}", r, 0, 3.4, RES_WALL)
        c.rect(f"Mass_{i + 1}_Roof", [r[0] - 0.4, r[1] - 0.4, r[2] + 0.4, r[3] + 0.4], 3.4, 0.25, ZF["residential"])
        horiz = (r[2] - r[0]) > (r[3] - r[1])
        n = int(((r[2] - r[0]) if horiz else (r[3] - r[1])) // 3.2)
        for k in range(n):          # facade glazing rhythm: illustrative, says nothing about units
            if horiz:
                px = r[0] + 1.8 + k * 3.2
                c.box(f"Mass_{i + 1}_GlazeS{k}", px, r[1] - 0.02, 1.0, 1.6, 0.05, 1.5, GLASS)
                c.box(f"Mass_{i + 1}_GlazeN{k}", px, r[3] + 0.02, 1.0, 1.6, 0.05, 1.5, GLASS)
            else:
                py = r[1] + 1.8 + k * 3.2
                c.box(f"Mass_{i + 1}_GlazeW{k}", r[0] - 0.02, py, 1.0, 0.05, 1.6, 1.5, GLASS)
                c.box(f"Mass_{i + 1}_GlazeE{k}", r[2] + 0.02, py, 1.0, 0.05, 1.6, 1.5, GLASS)
    ct = LAY["residential_court"]
    c.rect("GardenCourt_Paving", [ct[0], -51.2, ct[2], -48.8], 0, 0.04, PAVE)
    for i, (bx, by) in enumerate([(-56, -47), (-46, -53.5), (-40, -47)]):
        c.box(f"GardenBench_{i}", bx, by, 0, 1.8, 0.45, 0.45, WOOD)
    label("Residential_General_Accommodation", -49, -40, 1.3, 4.2)
    c = room_root("Residential_Arthur_Function_Location")
    ax, ay = LAY["arthur_marker"]
    ROOT["Residential_Arthur_Function_Location"].location = (ax, ay, 0)
    ROOT["Residential_Arthur_Function_Location"]["layout_status"] = "LAYOUT_TBD"
    c.cyl("Marker_Ring", ax, ay, 3.66, 2.0, 0.04, GOLD)
    c.cyl("Marker_Ring_Inner", ax, ay, 3.66, 1.7, 0.05, ZF["residential"])
    c.cyl("Marker_Dot", ax, ay, 3.66, 0.35, 0.08, GOLD)
    label("Residential_Arthur_Function_Location", ax - 9, ay, 0.8, 4.2)
residential()

# ---------------------------------------------------------------- 09 Outdoor recreation (Episode 100)
def outdoor():
    o = LAY["outdoor"]
    L.rect("Outdoor_Hardscape_Proposed", o["hardscape"], 0, 0.04, PLAZA)
    c = room_root("Outdoor_Multipurpose_Court")
    r = o["multipurpose_court"]
    ROOT["Outdoor_Multipurpose_Court"].location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    c.rect("Surface", r, 0.04, 0.03, COURT_OUT)
    court_lines(c, "Lines", [r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 1], 0.07, WHITE)
    cy = (r[1] + r[3]) / 2
    c.cyl("CenterCircle", (r[0] + r[2]) / 2, cy, 0.07, 1.6, 0.004, WHITE)
    c.cyl("CenterCircle_Fill", (r[0] + r[2]) / 2, cy, 0.07, 1.52, 0.006, COURT_OUT)
    for k, bx, d in (("W", r[0] + 1.4, 1), ("E", r[2] - 1.4, -1)):
        hoop(c, f"Hoop_{k}", bx, cy, d)
    label("Outdoor_Multipurpose_Court", (r[0] + r[2]) / 2, cy + 3.6, 0.95, 0.13)
    f = room_root("Outdoor_Futsal_Space")
    ROOT["Outdoor_Futsal_Space"].location = ((r[0] + r[2]) / 2, cy, 0)
    court_lines(f, "Lines", [r[0] + 1.5, r[1] + 1.6, r[2] - 1.5, r[3] - 1.6], 0.071, YELLOW, 0.07)
    goal(f, "Goal_W", r[0] + 0.9, cy, 1)
    goal(f, "Goal_E", r[2] - 0.9, cy, -1)
    label("Outdoor_Futsal_Space", (r[0] + r[2]) / 2, cy - 3.6, 0.75, 0.13)
    c = room_root("Outdoor_Half_Basketball")
    r = o["half_basketball"]
    ROOT["Outdoor_Half_Basketball"].location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    c.rect("Surface", r, 0.04, 0.03, COURT_OUT2)
    court_lines(c, "Lines", [r[0] + 0.6, r[1] + 0.6, r[2] - 0.6, r[3] - 0.6], 0.07, WHITE, 0.08, False)
    cx = (r[0] + r[2]) / 2
    court_lines(c, "Key", [cx - 2.2, r[1] + 0.6, cx + 2.2, r[1] + 5.6], 0.07, WHITE, 0.07, False)
    hoop(c, "Hoop", cx, r[1] + 1.0, 0, 1)
    label("Outdoor_Half_Basketball", cx, r[3] - 3.0, 0.8, 0.13)
    c = room_root("Outdoor_Skate_Surface")
    r = o["skate_surface"]
    ROOT["Outdoor_Skate_Surface"].location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    c.rect("Smooth_Slab", r, 0.04, 0.03, SMOOTH)   # flat only: no ramps invented
    g = c.grp("Skateboard", r[0] + 4, r[1] + 2, 25, 0.07)
    g.box("Deck", 0, 0, 0.08, 0.8, 0.2, 0.015, WOOD_D)
    for k, wx in enumerate([-0.28, 0.28]):
        g.cyl(f"Wheels_{k}", wx, 0, 0.0, 0.035, 0.2, WHITE, "Y")
    label("Outdoor_Skate_Surface", (r[0] + r[2]) / 2 + 2, (r[1] + r[3]) / 2, 0.8, 0.13)
    c = room_root("Outdoor_Tables_Covered_Area")
    r = o["covered_area"]
    ROOT["Outdoor_Tables_Covered_Area"].location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    for i, (px, py) in enumerate([(r[0], r[1]), (r[2], r[1]), (r[0], r[3]), (r[2], r[3]), ((r[0] + r[2]) / 2, r[1]), ((r[0] + r[2]) / 2, r[3])]):
        c.box(f"Cover_Post_{i}", px, py, 0.04, 0.16, 0.16, 2.7, WOOD_D)
    c.rect("Cover_Frame", [r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], 2.74, 0.08, WOOD_D)
    for i in range(12):
        c.box(f"Cover_Slat_{i}", r[0] + 0.2 + i * (r[2] - r[0] - 0.4) / 11, (r[1] + r[3]) / 2, 2.82, 0.3, r[3] - r[1] + 0.6, 0.05, WOOD)
    c.box("SkateCabinet", r[2] - 0.6, r[3] - 0.5, 0.04, 1.0, 0.5, 1.6, WOOD_D)   # cabinet position not stated in Episode 100
    for i, (tx, ty) in enumerate(o["tables"]):
        g = c.grp(f"PicnicTable_{i + 1}", tx, ty, 0, 0.04)
        g.box("Top", 0, 0, 0.7, 1.8, 0.8, 0.05, WOOD)
        g.box("LegA", -0.7, 0, 0, 0.06, 0.7, 0.7, METAL)
        g.box("LegB", 0.7, 0, 0, 0.06, 0.7, 0.7, METAL)
        g.box("BenchS", 0, -0.75, 0.4, 1.8, 0.3, 0.05, WOOD)
        g.box("BenchN", 0, 0.75, 0.4, 1.8, 0.3, 0.05, WOOD)
        g.box("BenchLegS", 0, -0.75, 0, 1.4, 0.06, 0.4, METAL)
        g.box("BenchLegN", 0, 0.75, 0, 1.4, 0.06, 0.4, METAL)
    label("Outdoor_Tables_Covered_Area", -55.5, 7.6, 0.8, 0.13)
outdoor()

# ---------------------------------------------------------------- 10 Future expansion (unbuilt)
def future():
    c = room_root("Future_Expansion_Zone")
    r = LAY["future_zone"]
    ROOT["Future_Expansion_Zone"].location = ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0)
    c.rect("Unbuilt_Ground", r, 0, 0.02, GRAVEL)
    def dashes(a, b, fixed, horiz):
        n = int((b - a) // 2.0)
        for i in range(n):
            s = a + i * 2.0 + 0.4
            if horiz: c.box(f"Outline_Dash_h{fixed}_{i}", s + 0.6, fixed, 0.02, 1.2, 0.25, 0.04, DASH)
            else: c.box(f"Outline_Dash_v{fixed}_{i}", fixed, s + 0.6, 0.02, 0.25, 1.2, 0.04, DASH)
    dashes(r[0], r[2], r[1], True); dashes(r[0], r[2], r[3], True)
    dashes(r[1], r[3], r[0], False); dashes(r[1], r[3], r[2], False)
    label("Future_Expansion_Zone", (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 1.5, 0.3)
future()

# ---------------------------------------------------------------- roofs (hidden: cutaway)
for cname, rects in LAY["roofs"].items():
    rc = subcoll(cname, cname + "_Roof_Hidden_For_Cutaway")
    R = Ctx(rc)
    for i, r in enumerate(rects):
        R.rect(f"{cname}_Roof_{i}", [r[0] - 0.4, r[1] - 0.4, r[2] + 0.4, r[3] + 0.4], FT + WH, 0.25, ROOF)
    rc.hide_render = True
    rc.hide_viewport = True

# ---------------------------------------------------------------- landscape
def landscape():
    occupied = [s["rect"] for s in ROOMS.values()] + LAY["residential_masses"] + LAY["paths"] + [LAY["future_zone"], LAY["outdoor"]["hardscape"],
               LAY["residential_court"], [-11, -22, 6, -13], [14, -22, 24, -13], LAY["commons_dining_link"]]
    def free(x, y, m=2.2):
        return all(not (r[0] - m < x < r[2] + m and r[1] - m < y < r[3] + m) for r in occupied)
    rnd = random.Random(86100)
    n = 0
    while n < 150:
        x, y = rnd.uniform(site[0] + 5, site[2] - 5), rnd.uniform(site[1] + 5, site[3] - 6)
        if not free(x, y):
            continue
        s = rnd.uniform(0.8, 1.35)
        L.cyl(f"Tree_{n:03d}_Trunk", x, y, 0, 0.16 * s, 2.2 * s, TRUNK)
        L.sph(f"Tree_{n:03d}_Crown", x, y, 3.3 * s, 3.2 * s, LEAF if n % 3 else LEAF2, 0.9)
        L.sph(f"Tree_{n:03d}_Crown2", x + 0.6 * s, y - 0.4 * s, 2.7 * s, 2.2 * s, LEAF2 if n % 3 else LEAF, 0.9)
        occupied.append([x - 1.5, y - 1.5, x + 1.5, y + 1.5])
        n += 1
    for i, x in enumerate(range(-30, 44, 9)):          # benches and lamps along the proposed spine
        if not (6 < x < 14):
            L.box(f"SpineBench_{i}", x, 9.5, 0, 1.8, 0.45, 0.45, WOOD)
        L.cyl(f"Lamp_{i}_Post", x + 4, 5.6, 0, 0.05, 3.2, DARK)
        L.sph(f"Lamp_{i}_Head", x + 4, 5.6, 3.3, 0.3, LIGHT)
    for i, x in enumerate(range(-30, 46, 10)):
        L.cyl(f"LampS_{i}_Post", x, -30.6, 0, 0.05, 3.2, DARK)
        L.sph(f"LampS_{i}_Head", x, -30.6, 3.3, 0.3, LIGHT)
    for i, r in enumerate([[-84, 11.3, -72, 12.2], [-67, 11.3, -38, 12.2], [-84.9, -22, -84.1, 11], [-84, -22.9, -36, -22.1]]):
        L.rect(f"Hedge_{i}", r, 0, 0.9, LEAF)      # hedge frame of the outdoor recreation area
    for i, (px, py) in enumerate([(-39, 12.6), (-35, 12.6), (-19.6, 12.6), (-14.4, 12.6), (10.6, 25.5), (-28.4, -11.5), (41.4, -11.5), (-10.6, -34.8), (-5.4, -34.8)]):
        L.box(f"Planter_{i}", px, py, 0, 0.9, 0.9, 0.5, WHITE)
        L.sph(f"Planter_{i}_Plant", px, py, 0.8, 0.9, LEAF2, 0.8)
    for i in range(6):
        L.sph(f"TerraceShrub_{i}", -9 + i * 2.6, -21, 0.5, 1.0, LEAF, 0.8)
    sofa(Ctx(COLL["11_Circulation_Landscape"], None, "LoL_Terrace_"), "Lounge_A", -4, -17, 0, 2.2, FABRIC)
    sofa(Ctx(COLL["11_Circulation_Landscape"], None, "CS_Terrace_"), "Lounge_A", 19, -17, 0, 2.2, FABRIC)
landscape()

# ---------------------------------------------------------------- board (camera 01 only)
def board():
    cam = LAY["cameras"]["01_masterplan_topdown"]
    cx, cy = cam["center"]
    w = cam["ortho_scale"]
    h = w * cam["res"][1] / cam["res"][0]
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    B = Ctx(BOARD)
    B.rect("Board_Paper", [x0 - 5, y0 - 5, x1 + 5, y1 + 5], -0.09, 0.02, PAPER)
    B.rect("Board_Legend_Panel", [site[2] + 3, y0 - 5, x1 + 5, y1 + 5], -0.05, 0.06, PAPER)
    B.rect("Board_Title_Panel", [x0 - 5, site[3] + 1.5, x1 + 5, y1 + 5], -0.05, 0.06, PAPER)
    B.rect("Board_Footer_Panel", [x0 - 5, y0 - 5, x1 + 5, site[1] - 1.5], -0.05, 0.06, PAPER)
    z = 0.05
    text(BOARD, "Board_Title", "KAIROS CAMPUS, LOS ANGELES", x0 + 4, y1 - 4.4, z, 4.4, INK, ax="LEFT")
    text(BOARD, "Board_Subtitle", "Implantação conceitual das funções estabelecidas até o Episódio 128 (07/02/2027)", x0 + 86, y1 - 4.4, z, 2.3, INK, ax="LEFT")
    text(BOARD, "Board_Disclaimer", DISCLAIMER, (x0 + site[2] + 3) / 2, (y0 + site[1] - 1.5) / 2, z, 2.6, mat("Board_Red", (0.62, 0.12, 0.10), 0.6))
    lx, ly = site[2] + 7, site[3] - 6
    text(BOARD, "Legend_Title", "LEGENDA", lx, ly, z, 3.0, INK, ax="LEFT")
    ly -= 6
    for zone, name in ZONE_PT.items():
        B.box("Legend_Swatch_" + zone, lx + 1.8, ly, z, 3.6, 2.6, 0.02, ZF[zone])
        text(BOARD, "Legend_" + zone, name, lx + 5.2, ly, z, 2.0, INK, ax="LEFT")
        ly -= 4.4
    for i in range(3):
        B.box(f"Legend_Dash_{i}", lx + 0.6 + i * 1.3, ly, z, 0.9, 0.3, 0.02, DASH)
    text(BOARD, "Legend_future", "Expansão futura,\nnão construída", lx + 5.2, ly, z, 2.0, INK, ax="LEFT")
    ly -= 6.5
    B.cyl("Legend_Marker", lx + 1.8, ly, z, 1.3, 0.02, GOLD)
    text(BOARD, "Legend_marker_text", "Marcador de função\n(layout TBD)", lx + 5.2, ly, z, 2.0, INK, ax="LEFT")
    ly -= 8
    notes = ("NOTAS\n"
             "Cores: leitura do diagrama,\nnão identidade canônica.\n"
             "Sem norte, sem endereço,\nsem medidas.\n"
             "Posições, formas e proporções\nsão propostas editáveis.\n"
             "Residencial: volumes fechados,\nsem contagem de quartos.\n"
             "Fontes: CAMPUS.md,\nEpisódios 86 e 100.")
    text(BOARD, "Legend_Notes", notes, lx, ly, z, 1.7, INK, ax="LEFT", ay="TOP")
    B.rect("Site_Outline_S", [site[0], site[1] - 0.3, site[2], site[1]], z, 0.02, DASH)
    B.rect("Site_Outline_N", [site[0], site[3], site[2], site[3] + 0.3], z, 0.02, DASH)
    B.rect("Site_Outline_W", [site[0] - 0.3, site[1], site[0], site[3]], z, 0.02, DASH)
    B.rect("Site_Outline_E", [site[2], site[1], site[2] + 0.3, site[3]], z, 0.02, DASH)
board()

# label plates (need evaluated text sizes)
bpy.context.view_layer.update()
for o, coll, pm in TEXTS:
    d = o.dimensions
    p = bpy.data.objects.new(o.name + "_Plate", mesh("cube", pm))
    coll.objects.link(p)
    p.location = (o.location.x, o.location.y, o.location.z - 0.025)
    p.scale = (d.x + o.data.size * 0.9, d.y + o.data.size * 0.7, 0.02)

# ---------------------------------------------------------------- lighting and cameras
CL = COLL["13_Cameras_Lighting"]
sun_data = bpy.data.lights.new("Sun_Proposed_Direction", "SUN")
sun_data.energy, sun_data.angle = 4.0, math.radians(3)
sun = bpy.data.objects.new("Sun_Proposed_Direction", sun_data)
CL.objects.link(sun)
sun.rotation_euler = (math.radians(38), math.radians(8), math.radians(-38))
world = bpy.data.worlds.new("Kairos_World")
try:
    world.use_nodes = True
except Exception:
    pass
bg = next((n for n in world.node_tree.nodes if n.type == "BACKGROUND"), None)
if bg:
    bg.inputs[0].default_value = (0.78, 0.86, 1.0, 1.0)
    bg.inputs[1].default_value = 0.9
scene.world = world

CAMS = {}
for name, spec in LAY["cameras"].items():
    cd = bpy.data.cameras.new("Camera_" + name)
    co = bpy.data.objects.new("Camera_" + name, cd)
    CL.objects.link(co)
    cd.clip_start, cd.clip_end = 0.5, 2000
    if spec["type"] == "ORTHO":
        cd.type, cd.ortho_scale = "ORTHO", spec["ortho_scale"]
        co.location = (spec["center"][0], spec["center"][1], 300)
    else:
        cd.lens = spec["lens"]
        co.location = spec["loc"]
        co.rotation_euler = (Vector(spec["target"]) - Vector(spec["loc"])).to_track_quat("-Z", "Y").to_euler()
    co["render_width"], co["render_height"] = spec["res"]
    co["show_board"] = bool(spec.get("board"))
    CAMS[name] = co
scene.camera = CAMS["02_isometric_overview"]

# ---------------------------------------------------------------- validation
def validate():
    res, objs = [], bpy.data.objects
    def check(n, title, ok, detail=""):
        res.append({"n": n, "check": title, "passed": bool(ok), "detail": detail})
    def has(*ids):
        return all(i in objs and objs[i].get("canon_status") for i in ids)
    def stations(rid):
        return len([o for o in objs if re.fullmatch(rid + r"_Station_\d", o.name)])
    lol = ["LoL_Black_Training", "LoL_Blue_Training", "LoL_White_Training"]
    cs = ["CS_Main_Training", "CS_Green_Training"]
    com = ["Commons_Maker_Lab", "Commons_Music_Room", "Commons_Photo_Film", "Commons_Kitchen_Studio", "Commons_Kairos_Community"]
    check(1, "Three League training rooms, five stations each", has(*lol) and all(stations(r) == 5 for r in lol), str({r: stations(r) for r in lol}))
    check(2, "Two Counter-Strike training rooms, five stations each", has(*cs) and all(stations(r) == 5 for r in cs), str({r: stations(r) for r in cs}))
    check(3, "Five confirmed Commons rooms", has(*com) and all(objs[r]["canon_status"] == "CONFIRMED" for r in com))
    shared = [objs[r].get("shared_between", "") for r in com + ["Commons_Shared_Lounge"]]
    check(4, "Commons shared by both divisions", all("League of Legends" in s and "Counter-Strike" in s for s in shared))
    rm = LAY["residential_masses"]
    res_x1 = max(r[2] for r in rm)
    rec, gym, con = ROOMS["Recreation_Indoor_Multipurpose_Court"]["rect"], ROOMS["Performance_Gym"]["rect"], ROOMS["Recreation_Gym_Connection"]["rect"]
    overlap = min(r[1] for r in rm) < rec[3] and max(r[3] for r in rm) > rec[1] and gym[1] < rec[3] and gym[3] > rec[1]
    check(5, "Recreation Center between residential and performance", res_x1 <= rec[0] and rec[2] <= gym[0] and overlap, f"residential<= {res_x1}, rec {rec[0]}..{rec[2]}, performance from {gym[0]}")
    def door_in(rid, side, lo, hi):
        return any(k == "door" and lo <= c <= hi for c, w, k in ROOMS[rid].get("openings", {}).get(side, []))
    check(6, "Recreation Center directly connected to the gym", con[0] == rec[2] and con[2] == gym[0] and door_in("Recreation_Indoor_Multipurpose_Court", "E", con[1], con[3]) and door_in("Performance_Gym", "W", con[1], con[3]) and has("Recreation_Gym_Connection"))
    oc = LAY["outdoor"]["multipurpose_court"]
    disjoint = oc[2] < rec[0] or oc[0] > rec[2] or oc[3] < rec[1] or oc[1] > rec[3]
    check(7, "Indoor and outdoor recreation are distinct places", has("Recreation_Indoor_Multipurpose_Court", "Outdoor_Multipurpose_Court") and disjoint and objs["Outdoor_Multipurpose_Court"].users_collection[0] != objs["Recreation_Indoor_Multipurpose_Court"].users_collection[0])
    names = [o.name for o in objs] + [c.name for c in bpy.data.collections]
    res_objs = [o for c in COLL["07_Residential"].children_recursive for o in c.objects]
    check(8, "Arthur represented as a function, no separate Casa Arthur", has("Residential_Arthur_Function_Location") and objs["Residential_Arthur_Function_Location"].get("layout_status") == "LAYOUT_TBD" and not any(re.search(r"casa[_ ]?arthur", n, re.I) for n in names) and not any("Wall_" in o.name for o in res_objs))
    fut = [o for c in COLL["10_Future_Expansion_Unbuilt"].children_recursive for o in c.objects]
    check(9, "Future divisions remain unbuilt", objs["Future_Expansion_Zone"]["canon_status"] == "PLANNED_NOT_BUILT" and all(re.search(r"Future_Expansion_Zone($|_Unbuilt_Ground|_Outline_Dash)", o.name) for o in fut) and not any(re.search(r"street.?fighter|rocket.?league|sim.?racing|ea.?sports|formula", n, re.I) for n in names), f"{len(fut)} objects, outline and ground only")
    bodies = [o.data.body for o in objs if o.type == "FONT"]
    alltext = "\n".join(bodies + names)
    check(10, "No restaurant partnership depicted", not re.search(r"in-?n-?out|chipotle|chick-?fil", alltext, re.I))
    check(11, "No public arena or spectator stands", not re.search(r"arena|bleacher|arquibancada|grandstand|stadium", alltext, re.I))
    check(12, "No dimensions, address or parking", not re.search(r"\d\s*(m²|m2|m\b|metros|ft\b|vagas)|sunset|playa vista|parking|estacionamento|boulevard|north_arrow", "\n".join(bodies) + "\n" + "\n".join(names), re.I))
    tt = len([o for o in objs if re.fullmatch(r"Recreation_Table_Tennis_TableTennis_Table_\d", o.name)])
    check(13, "Exactly two table-tennis tables", tt == 2, str(tt))
    missing = [a["id"] for a in INV["areas"] if a["id"] not in objs]
    check(14, "Every inventory area has a tagged object", not missing, str(missing))
    untagged = [a["id"] for a in INV["areas"] if a["id"] in objs and not all(k in objs[a["id"]].keys() for k in ("canon_status", "canonical_name", "functional_purpose", "source_reference", "layout_is_proposed", "notes"))]
    check(15, "All room objects carry the six metadata fields", not untagged, str(untagged))
    check(16, "Disclaimer present on the board", DISCLAIMER in bodies)
    return res

report = validate()
json.dump({"all_passed": all(r["passed"] for r in report), "objects": len(bpy.data.objects), "checks": report},
          open(os.path.join(HERE, "validation_report.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
for r in report:
    print(("PASS " if r["passed"] else "FAIL ") + f'{r["n"]:>2} {r["check"]} {r["detail"]}')
if not all(r["passed"] for r in report):
    print("VALIDATION FAILED")
    sys.exit(1)
print("OBJECTS", len(bpy.data.objects))

# ---------------------------------------------------------------- render setup, save, render
scene.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for dev_type in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = dev_type
            (getattr(prefs, "refresh_devices", None) or prefs.get_devices)()
            if any(d.type == dev_type for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == dev_type
                scene.cycles.device = "GPU"
                print("GPU", dev_type)
                break
        except Exception as e:
            print("device", dev_type, e)
except Exception as e:
    print("cycles prefs", e)
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception as e:
    print("view", e)
scene.render.resolution_x, scene.render.resolution_y = 3840, 2160

BLEND = os.path.join(HERE, "kairos_campus_master.blend")
bpy.ops.wm.save_as_mainfile(filepath=BLEND, compress=True)
print("SAVED", BLEND)

# ---------------------------------------------------------------- web export (interactive viewer)
if "--export" in ARGV:
    WEB = os.path.normpath(os.path.join(HERE, "..", "..", "website"))
    os.makedirs(os.path.join(WEB, "public", "campus"), exist_ok=True)
    roof_colls = [c for c in bpy.data.collections if c.name.endswith("_Roof_Hidden_For_Cutaway")]
    for c in roof_colls:
        c.hide_viewport = False
    bpy.context.view_layer.update()
    skip = set(COLL["12_Annotations_Legends"].all_objects) | set(COLL["13_Cameras_Lighting"].all_objects)
    for o in bpy.data.objects:
        try:
            o.select_set(o not in skip)
        except Exception as e:
            print("select", o.name, e)
    glb = os.path.join(WEB, "public", "campus", "campus.glb")
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True, export_extras=True,
                              export_yup=True, export_cameras=False, export_lights=False, export_apply=False)
    for c in roof_colls:
        c.hide_viewport = True
    viewer = {
        "disclaimer": DISCLAIMER,
        "note": "Generated by artifacts/kairos-campus-concept/build_kairos_campus.py --export glb. Do not edit by hand. Geometry is a proposal, not canon.",
        "zoneColors": {z: "#%02x%02x%02x" % tuple(int(v * 255) for v in c) for z, c in ZONE_COLORS.items()},
        "areas": [{**{k: a[k] for k in ("id", "zone", "canonical_name", "canon_status", "functional_purpose", "source_reference", "known_interior", "unknown", "notes")},
                   "label": a["label"].replace(chr(10), " "), "position": LABEL_POS.get(a["id"]), "rect": ROOMS.get(a["id"], {}).get("rect")} for a in INV["areas"]],
        "views": [{"id": n, "position": s.get("loc") or [s["center"][0], s["center"][1] - 1.5, 190], "target": s.get("target") or [s["center"][0], s["center"][1], 0]} for n, s in LAY["cameras"].items()],
    }
    json.dump(viewer, open(os.path.join(WEB, "src", "lib", "campus", "campus-viewer.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print("EXPORTED", glb, os.path.getsize(glb))

if RENDER != "none":
    os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)
    preview = RENDER == "preview"
    scene.cycles.samples = 24 if preview else 96
    for name, co in CAMS.items():
        if ONLY and not any(name.startswith(o) for o in ONLY):
            continue
        scene.camera = co
        scene.render.resolution_x, scene.render.resolution_y = co["render_width"], co["render_height"]
        scene.render.resolution_percentage = 33 if preview else 100
        BOARD.hide_render = not co["show_board"]
        sub = "renders/preview" if preview else "renders"
        os.makedirs(os.path.join(HERE, sub), exist_ok=True)
        scene.render.filepath = os.path.join(HERE, sub, name + ".png")
        bpy.ops.render.render(write_still=True)
        print("RENDERED", scene.render.filepath)
    BOARD.hide_render = False
    scene.camera = CAMS["02_isometric_overview"]
    scene.render.resolution_percentage = 100

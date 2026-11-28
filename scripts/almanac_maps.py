#!/usr/bin/env python3
"""GIS maps for the Antigo Almanac: each map overlays one dataset on the county, held to Laws of UX.

Writes almanac/maps/<id>.webp (1000 px) and <id>@2x.webp (2000 px, opened by "Tap to enlarge"), plus maps.json,
which scripts/almanac_ux.py turns into figures inside each almanac entry.

Standards every map follows (the UX rules, made concrete):
- Title states the finding; one line says what to notice (answer first).
- North up, Antigo outlined in rust on every map, the same base and type everywhere (Jakob, Aesthetic-Usability, Von Restorff).
- Six classes or fewer, colour-blind-safe colours, a key in HTML with real text (Miller, Hick).
- Labels and key are HTML at 13 px or more, so they stay readable on phones; the picture has no tiny baked-in text.
- Small WebP files, loaded only when the entry is opened (Doherty). Tap to enlarge and pinch to zoom (Fitts).
- Every map names its source and year, and says plainly when a value is an estimate or has a wide margin of error.
"""
import json, math, os, re, sys, random, zipfile, io, csv, gzip
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pyproj import Transformer
sys.path.insert(0, '/home/claude/scripts/parcels')
from dbf import dbf_iter, shp_iter

OUT = '/home/claude/blessedfig-shop/almanac/maps'
RAW = '/home/claude/almaps/raw'
os.makedirs(OUT, exist_ok=True)
X0, YT, C = 565004.0, 555393.8125, 30.0
G = np.load('/home/claude/forage/work/grid30.npz')
MASK = G['mask'] == 1
H, W = MASK.shape
rows, cols = np.where(MASK)
PAD = 14
R0, R1, C0, C1 = rows.min() - PAD, rows.max() + PAD, cols.min() - PAD, cols.max() + PAD
TO3071 = Transformer.from_crs(4326, 3071, always_xy=True)
W2 = 2000                                   # drawn at 2x, saved at 2x and 1x
PAPER = (244, 240, 230)
INK = (31, 42, 36)
RUST = (176, 80, 42)
WATER = (156, 195, 213)
WATER_EDGE = (110, 160, 185)


def frame(r0=R0, r1=R1, c0=C0, c1=C1, width=W2):
    f = width / (c1 - c0)
    return {'r0': r0, 'c0': c0, 'f': f, 'w': width, 'h': int(round((r1 - r0) * f))}


FR = frame()


def xy(x, y, fr=None):          # EPSG:3071 metres -> output pixel
    fr = fr or FR
    return (((x - X0) / C - fr['c0']) * fr['f'], ((YT - y) / C - fr['r0']) * fr['f'])


def ll(lon, lat, fr=None):
    x, y = TO3071.transform(lon, lat)
    return xy(x, y, fr)


def pct(lon, lat, fr=None):
    fr = fr or FR
    px, py = ll(lon, lat, fr)
    return 100 * px / fr['w'], 100 * py / fr['h']


def crop(a, fr=None, fillv=None):
    """window of a grid array for a frame; parts outside the grid are filled (paper colour for RGB, 0 otherwise)"""
    fr = fr or FR
    r0, c0 = int(fr['r0']), int(fr['c0'])
    r1 = r0 + int(round(fr['h'] / fr['f'])); c1 = c0 + int(round(fr['w'] / fr['f']))
    out = np.zeros((r1 - r0, c1 - c0) + a.shape[2:], a.dtype)
    if fillv is None and a.ndim == 3:
        fillv = PAPER
    if fillv is not None:
        out[:] = fillv
    sr0, sc0, sr1, sc1 = max(r0, 0), max(c0, 0), min(r1, a.shape[0]), min(c1, a.shape[1])
    if sr1 > sr0 and sc1 > sc0:
        out[sr0 - r0:sr1 - r0, sc0 - c0:sc1 - c0] = a[sr0:sr1, sc0:sc1]
    return out


def raster_rgb(rgb, fr=None, smooth=True):
    """grid-resolution RGB array -> output-size image"""
    fr = fr or FR
    im = Image.fromarray(crop(rgb, fr).astype(np.uint8))
    return im.resize((fr['w'], fr['h']), Image.LANCZOS if smooth else Image.NEAREST)


# ---------- shared layers ----------
def hillshade(dem, az=315, alt=45):
    d = np.where(np.isfinite(dem), dem, np.nanmean(dem))
    gy, gx = np.gradient(d, C)
    slope = np.arctan(np.hypot(gx, gy) * 2.0)
    aspect = np.arctan2(-gx, gy)
    a, z = math.radians(az), math.radians(90 - alt)
    hs = np.cos(z) * np.cos(slope) + np.sin(z) * np.sin(slope) * np.cos(a - aspect)
    return np.clip(hs, 0, 1)


HS = hillshade(G['dem'])
WATERM = G['water'] == 1


def base(fill=None, shade=0.18, outside_shade=0.10):
    """paper background with soft relief; `fill` = HxWx3 colours for the county (None = paper)"""
    hs = HS[..., None]
    rgb = np.empty((H, W, 3), float); rgb[:] = PAPER
    if fill is not None:
        rgb[MASK] = fill[MASK]
    k = np.where(MASK, shade, outside_shade)[..., None]
    rgb = rgb * (1 - k) + rgb * hs * k * 1.6
    rgb = np.where(~MASK[..., None], rgb * 0.97 + 255 * 0.03, rgb)
    rgb[WATERM] = WATER
    return np.clip(rgb, 0, 255)


def geo_rings(geom):
    t = geom['type']; cs = geom['coordinates']
    polys = [cs] if t == 'Polygon' else cs if t == 'MultiPolygon' else []
    return [ring for p in polys for ring in p]


COUNTIES = json.load(open('/home/claude/forage/raw/county_boundary.geojson'))['features']
LANG = [f for f in COUNTIES if f['properties']['COUNTY_NAME'] == 'Langlade'][0]
COUSUB = json.load(open(f'{RAW}/cousub.geojson'))['features']
ANTIGO = [f for f in COUSUB if f['properties']['NAME'] == 'Antigo city'][0]


def draw_ll_rings(d, geom, fr=None, fill=None, line=None, width=1):
    for ring in geo_rings(geom):
        pts = [ll(x, y, fr) for x, y in ring]
        if len(pts) > 2:
            if fill is not None:
                d.polygon(pts, fill=fill)
            if line is not None:
                d.line(pts + [pts[0]], fill=line, width=width, joint='curve')


def roads(d, fr=None, color=(120, 112, 98), width=3):
    for r, shp in zip(dbf_iter(f'{RAW}/tiger/tl_2024_55067_roads.dbf'), shp_iter(f'{RAW}/tiger/tl_2024_55067_roads.shp')):
        if r['MTFCC'] not in ('S1100', 'S1200') and not re.match(r'(US|State) Hwy', r['FULLNAME'] or ''):
            continue
        for part in shp:
            pts = [ll(x, y, fr) for x, y in part]
            if len(pts) > 1:
                d.line(pts, fill=color, width=width)


def outlines(d, fr=None, antigo=True, county=True):
    if county:
        draw_ll_rings(d, LANG['geometry'], fr, line=INK, width=5)
    if antigo:
        draw_ll_rings(d, ANTIGO['geometry'], fr, line=RUST, width=6)


TOWNS = []
for L in (28, 30):
    for f in json.load(open(f'{RAW}/places{L}.json'))['features']:
        a = f['attributes']
        TOWNS.append((a['NAME'].replace(' city', '').replace(' village', '').replace(' CDP', ''), float(a['INTPTLON']), float(a['INTPTLAT'])))
IN_COUNTY = ['Antigo', 'White Lake', 'Elcho', 'Summit Lake', 'Post Lake']


def town_labels(fr=None, names=IN_COUNTY, dot=None):
    out = []
    for n, lon, lat in TOWNS:
        if n in names:
            x, y = pct(lon, lat, fr)
            out.append({'t': n, 'x': x, 'y': y - 2.2, 'k': 'town' if n == 'Antigo' else ''})
    return out


def save(im, mid):
    im = im.convert('RGB')
    im.save(f'{OUT}/{mid}@2x.webp', quality=80, method=6)
    sm = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    sm.save(f'{OUT}/{mid}.webp', quality=82, method=6)
    print(mid, sm.size, os.path.getsize(f'{OUT}/{mid}.webp') // 1024, 'KB')
    return sm.size


def sw(rgb):                      # key swatch css
    return 'background:rgb(%d,%d,%d)' % tuple(int(v) for v in rgb)


MAPS = []


def add(mid, entry, title, notice, alt, source, key, size, labels=None, table=None):
    MAPS.append({'id': mid, 'entry': entry, 'title': title, 'notice': notice, 'alt': alt, 'source': source,
                 'key': key, 'w': size[0], 'h': size[1], 'labels': labels or [], 'table': table})


# ---------- ACS by town ----------
def acs(table):
    rows = list(csv.reader(open(f'{RAW}/{table}.dat'), delimiter='|'))
    hdr = rows[0]
    return {r[0]: dict(zip(hdr, r)) for r in rows[1:]}


def town_geoid(f):
    return '0600000US' + f['properties']['GEOID']


def town_name(f):
    n = f['properties']['NAME']
    return 'City of Antigo' if n == 'Antigo city' else 'Village of White Lake' if n == 'White Lake village' else 'Town of ' + n.replace(' town', '')


def choropleth(values, classes, colors, fr=None, hatch=None):
    """values: {GEOID: v}; classes: list of upper bounds; draws towns. hatch: set of GEOIDs to hatch (unreliable)"""
    fr = fr or FR
    bg = raster_rgb(base(None, shade=0.12), fr)
    lay = Image.new('RGBA', bg.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for f in COUSUB:
        g = town_geoid(f); v = values.get(g)
        if v is None:
            col = (220, 216, 206, 230)
        else:
            i = next((k for k, ub in enumerate(classes) if v <= ub), len(classes) - 1)
            col = tuple(colors[i]) + (225,)
        draw_ll_rings(d, f['geometry'], fr, fill=col)
    if hatch:
        m = Image.new('L', bg.size, 0); md = ImageDraw.Draw(m)
        for f in COUSUB:
            if town_geoid(f) in hatch:
                draw_ll_rings(md, f['geometry'], fr, fill=255)
        stripes = Image.new('L', bg.size, 0); sd = ImageDraw.Draw(stripes)
        for k in range(-bg.size[1], bg.size[0], 22):
            sd.line([(k, 0), (k + bg.size[1], bg.size[1])], fill=190, width=6)
        from PIL import ImageChops
        lay.paste(Image.new('RGBA', bg.size, (255, 255, 255, 255)), (0, 0), ImageChops.multiply(m, stripes))
    for f in COUSUB:
        draw_ll_rings(d, f['geometry'], fr, line=(255, 255, 255, 255), width=3)
    bg = Image.alpha_composite(bg.convert('RGBA'), lay)
    wl = Image.fromarray(np.where(crop(WATERM, fr)[..., None], 255, 0).astype(np.uint8)[..., 0]).resize(bg.size, Image.NEAREST)
    bg.paste(Image.new('RGBA', bg.size, WATER + (255,)), (0, 0), wl)
    return bg


SEQ5 = [(237, 248, 233), (186, 228, 179), (116, 196, 118), (49, 163, 84), (0, 109, 44)]       # ColorBrewer Greens
SEQ5B = [(239, 243, 255), (189, 215, 231), (107, 174, 214), (49, 130, 189), (8, 81, 156)]     # Blues
SEQ5P = [(254, 237, 222), (253, 190, 133), (253, 141, 60), (230, 85, 13), (166, 54, 3)]       # Oranges


def town_table(values, fmt, moe=None, unit=''):
    rows = []
    for f in sorted(COUSUB, key=lambda f: -(values.get(town_geoid(f)) or -1)):
        g = town_geoid(f); v = values.get(g)
        rows.append([town_name(f), fmt(v) if v is not None else 'no estimate', ('± ' + fmt(moe[g])) if moe and g in moe else ''])
    return rows


# =====================================================================================
def m_landcover():
    lc = G['lc'].astype(int)
    cls = [((lc >= 4100) & (lc < 4400), (61, 107, 79), 'Upland forest'),
           ((lc >= 6400) & (lc < 6500), (118, 156, 150), 'Forested wetland (swamp)'),
           ((lc >= 6000) & (lc < 6400), (169, 196, 181), 'Open wetland and shrub swamp'),
           ((lc >= 2100) & (lc < 2200), (214, 170, 82), 'Cropland'),
           ((lc >= 3000) & (lc < 4000), (226, 214, 150), 'Hay, pasture and grass'),
           ((lc >= 1000) & (lc < 2000), (120, 110, 110), 'Towns and roads')]
    fill = np.zeros((H, W, 3)); fill[:] = (210, 205, 190)
    for m, col, _ in cls:
        fill[m] = col
    im = raster_rgb(base(fill, shade=0.22)); d = ImageDraw.Draw(im)
    outlines(d)
    key = [{'css': sw(c), 't': t} for _, c, t in cls] + [{'css': sw(WATER), 't': 'Lakes and rivers'}]
    add('landcover', 'Woods and water', 'Mostly woods, with farmland on the flats around Antigo',
        'Forest covers most of the county. The cropland is concentrated on the flat ground around Antigo and to the south and east; swamps follow the low ground in the north.',
        'Map of Langlade County land cover: forest across most of the county, cropland on the flats around Antigo, forested wetlands in the north.',
        'Wisconsin DNR and UW-Madison, Wiscland 2.0 land cover (imagery 2010-2014).', key, save(im, 'landcover'), town_labels())


def m_ownership():
    own = G['own']
    cls = [(own == 1, (47, 125, 58), 'County forest (open to the public)'),
           (own == 3, (138, 106, 32), 'National forest'),
           (own == 2, (42, 109, 176), 'State land (DNR)'),
           (own == 5, (154, 160, 160), 'Private forest open for walking (MFL open)'),
           ((own == 4) | (own == 7) | (own == 8), (106, 79, 176), 'Other public or tribal land'),
           (own == 6, (205, 196, 176), 'Private forest, closed (MFL closed)')]
    fill = np.zeros((H, W, 3)); fill[:] = (236, 231, 219)
    for m, col, _ in cls:
        fill[m] = col
    im = raster_rgb(base(fill, shade=0.16)); d = ImageDraw.Draw(im)
    outlines(d)
    pub = ((own == 1) | (own == 2) | (own == 3) | (own == 7) | (own == 8))[MASK].mean() * 100
    key = [{'css': sw(c), 't': t} for _, c, t in cls] + [{'css': sw((236, 231, 219)), 't': 'Other private land'}]
    add('ownership', 'Woods and water', f'About {pub:.0f} percent of the county is public land',
        'The county forest is the big green band across the middle and north; the national forest sits on the eastern edge. Most land near Antigo is private.',
        'Map of who owns Langlade County land: a large county forest across the middle and north, national forest in the east, private land around Antigo.',
        'Wisconsin statewide tax parcels (V12, 2025 tax roll) and Managed Forest Law listings, Wisconsin DNR. No owner names are shown.', key, save(im, 'ownership'), town_labels())


def m_elevation():
    dem = G['dem'] * 3.28084
    bands = [(1250, (63, 125, 96), 'Below 1,250 ft'), (1400, (130, 168, 110), '1,250 to 1,400 ft'), (1550, (205, 196, 140), '1,400 to 1,550 ft'),
             (1700, (196, 152, 98), '1,550 to 1,700 ft'), (99999, (150, 104, 76), 'Above 1,700 ft')]
    fill = np.zeros((H, W, 3))
    lo = -1
    for ub, col, _ in bands:
        fill[(dem > lo) & (dem <= ub)] = col; lo = ub
    im = raster_rgb(base(fill, shade=0.55)); d = ImageDraw.Draw(im)
    outlines(d)
    key = [{'css': sw(c), 't': t} for _, c, t in bands]
    add('elevation', 'The Antigo flats', 'Antigo sits on a high, flat plain ringed by hills',
        'The flat, even colour around Antigo is the outwash plain the glacier’s meltwater laid down; the bumpier ground around it is moraine. The land drops toward the Wolf River in the east.',
        'Shaded relief and elevation map of Langlade County: a flat plain around Antigo at about 1,500 feet, hillier moraines around it, lower ground in the east along the Wolf River.',
        'U.S. Geological Survey 3DEP elevation (1 arc-second).', key, save(im, 'elevation'), town_labels())


def m_frost():
    tpi = np.load('/home/claude/forage/work/micro30.npz')['tpi1k']
    cls = [(tpi < -10, (37, 84, 140), 'Deep low spots, where frost comes first'), ((tpi >= -10) & (tpi < -5), (125, 168, 205), 'Low ground')]
    fill = np.zeros((H, W, 3)); fill[:] = (238, 233, 220)
    for m, col, _ in cls:
        fill[m] = col
    im = raster_rgb(base(fill, shade=0.35)); d = ImageDraw.Draw(im)
    outlines(d)
    key = [{'css': sw(c), 't': t} for _, c, t in cls] + [{'css': sw((238, 233, 220)), 't': 'Level or higher ground'}]
    add('frost', 'Weather by month', 'Where cold air settles first on clear nights',
        'On calm, clear nights cold air slides downhill and pools in low spots, so frost comes earlier there and leaves later. This is worked out from the shape of the land, not measured temperatures.',
        'Map of Langlade County low spots where cold air pools, estimated from terrain: many small basins in the north and along stream valleys.',
        'Estimate from USGS 3DEP elevation: ground more than 5 or 10 metres below the average height within 1 km. Not a temperature record.', key, save(im, 'frost'), town_labels())


def m_soils_crops():
    # Antigo silt loam map units from the county soil survey (SSURGO WI067)
    mk = set()
    for line in open('/home/claude/gisdata/soils_wi067/WI067/tabular/mapunit.txt', encoding='latin-1'):
        p = [x.strip('"') for x in line.rstrip('\n').split('|')]
        if p[1].startswith('Antigo silt loam'):
            mk.add(p[-1])
    m = Image.new('L', (W, H), 0); dm = ImageDraw.Draw(m)
    prj = open('/home/claude/gisdata/soils_wi067/WI067/spatial/soilmu_a_wi067.prj').read()
    geo = 'GEOGCS' in prj and 'PROJCS' not in prj
    for r, shp in zip(dbf_iter('/home/claude/gisdata/soils_wi067/WI067/spatial/soilmu_a_wi067.dbf'), shp_iter('/home/claude/gisdata/soils_wi067/WI067/spatial/soilmu_a_wi067.shp')):
        if str(r.get('MUKEY')) not in mk:
            continue
        for ring in shp:
            pts = [TO3071.transform(x, y) if geo else (x, y) for x, y in ring]
            dm.polygon([((x - X0) / C, (YT - y) / C) for x, y in pts], fill=255)
    asl = np.array(m) > 0
    lc = G['lc'].astype(int)
    crop_ = (lc >= 2100) & (lc < 2200); pot = lc == 2140
    cls = [(asl & pot, (166, 54, 3), 'Potato or vegetable rotation on Antigo silt loam'),
           (asl & crop_ & ~pot, (253, 141, 60), 'Other crops on Antigo silt loam'),
           (asl & ~crop_, (253, 208, 162), 'Antigo silt loam, not cropped'),
           (~asl & crop_, (156, 140, 180), 'Crops on other soils')]
    fill = np.zeros((H, W, 3)); fill[:] = (232, 230, 220)
    for mm, col, _ in cls:
        fill[mm] = col
    im = raster_rgb(base(fill, shade=0.12)); d = ImageDraw.Draw(im)
    outlines(d)
    share = (asl & pot)[MASK].sum() / max(1, pot[MASK].sum()) * 100
    key = [{'css': sw(c), 't': t} for _, c, t in cls]
    add('soilcrops', 'The Antigo flats', f'The potato fields sit on the state soil',
        f'Antigo silt loam, Wisconsin’s state soil, covers the flats around the city. About {share:.0f} percent of the land mapped in potato or vegetable rotation lies on it.',
        'Map overlapping Antigo silt loam soil with cropland: the soil forms a broad patch around Antigo, and most potato and vegetable fields fall inside it.',
        'USDA NRCS Soil Survey of Langlade County (SSURGO); Wisconsin DNR Wiscland 2.0 crop rotation classes (2010-2014).', key, save(im, 'soilcrops'), town_labels())


def m_trout():
    fs = json.load(open(f'{RAW}/trout.geojson'))['features']
    im = raster_rgb(base(None, shade=0.25)); d = ImageDraw.Draw(im)
    cols = {'5 Trout in Total of Any Length': (8, 81, 156), '3 Trout in Total Over 8 inches': (230, 85, 13), 'Length, Bag and Possession Limits Vary by Water': (122, 1, 119)}
    names = {'5 Trout in Total of Any Length': 'Bag limit 5 trout, any length', '3 Trout in Total Over 8 inches': 'Bag limit 3 trout, 8 inches or more',
             'Length, Bag and Possession Limits Vary by Water': 'Special rules on that water'}
    for f in fs:
        g = f['geometry']; parts = [g['coordinates']] if g['type'] == 'LineString' else g['coordinates']
        for part in parts:
            pts = [xy(x, y) for x, y in part]
            if len(pts) > 1:
                d.line(pts, fill=cols.get(f['properties']['REGCAT'], (8, 81, 156)), width=5)
    outlines(d)
    n = len({f['properties']['STREAM'] for f in fs})
    key = [{'css': sw(cols[k]) + ';height:5px;border:0', 't': names[k]} for k in cols]
    add('trout', 'Spring in Antigo', f'About {n} named trout streams in and around the county',
        'Most of the county’s trout water runs through the forested north and east. Check the DNR rules for the stretch you fish; some waters have their own limits.',
        'Map of trout streams in Langlade County by regulation category; most are in the north and east.',
        'Wisconsin DNR, inland trout stream regulations layer (current season). Rules change; the DNR regulations are the authority.', key, save(im, 'trout'), town_labels())


def m_atv():
    s = open('/home/claude/forage/raw/kml/atv.kml').read()
    im = raster_rgb(base(None, shade=0.25)); d = ImageDraw.Draw(im)
    folders = re.split(r'<Folder>', s)[1:]
    groups = [('SEASONAL ATV-UTV TRAILS', (122, 1, 119), 6, 'Seasonal ATV and UTV trails'),
              ('AUTHORIZED FOREST ROADS', (230, 85, 13), 3, 'Forest roads open to ATVs'),
              ('AUTHORIZED RDS', (49, 130, 189), 3, 'Town and county roads open to ATVs and UTVs'),
              ('RESTRICTED RDS', (160, 160, 160), 3, 'Roads with restrictions')]
    order = [3, 2, 1, 0]
    drawn = {}
    for gi in order:
        tag, col, w, _ = groups[gi]
        for fo in folders:
            name = re.search(r'<name>([^<]*)', fo).group(1)
            if tag not in name.replace('  ', ' '):
                continue
            for c in re.findall(r'<LineString>.*?<coordinates>(.*?)</coordinates>', fo, re.S):
                pts = [ll(float(a), float(b)) for a, b, *_ in (p.split(',') for p in c.split())]
                if len(pts) > 1:
                    d.line(pts, fill=col, width=w); drawn[gi] = 1
    outlines(d)
    key = [{'css': sw(groups[i][1]) + ';height:%dpx;border:0' % max(3, groups[i][2] - 1), 't': groups[i][3]} for i in range(4) if i in drawn]
    add('atv', 'Spring in Antigo', 'ATV and UTV routes open May 1',
        'Seasonal trails (purple) link a web of town and county roads open to ATVs and UTVs. Some roads carry restrictions, shown in gray.',
        'Map of Langlade County ATV and UTV trails and authorized roads, covering most of the county.',
        'Langlade County, 2024 ATV-UTV trails and roads map. Routes change; check the county’s current map and trail reports.', key, save(im, 'atv'), town_labels())


def m_people():
    pop = {}
    for r in dbf_iter(f'{RAW}/tiger/tl_2020_55_tabblock20.dbf'):
        if r['COUNTYFP20'] == '067':
            pop[r['GEOID20']] = int(r['POP20'] or 0)
    im = raster_rgb(base(None, shade=0.22)); d = ImageDraw.Draw(im)
    rnd = random.Random(7); tot = 0; per = 5
    for r, shp in zip(dbf_iter(f'{RAW}/tiger/tl_2020_55067_tabblock20.dbf'), shp_iter(f'{RAW}/tiger/tl_2020_55067_tabblock20.shp')):
        n = pop.get(r['GEOID20'], 0); tot += n
        k = int(n / per + rnd.random())
        if not k:
            continue
        ring = max(shp, key=len); pts = [ll(x, y) for x, y in ring]
        mm = Image.new('L', (1, 1))
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        bx0, by0, bx1, by1 = min(xs), min(ys), max(xs), max(ys)
        poly = pts; placed = 0; tries = 0
        while placed < k and tries < k * 60:
            tries += 1
            px, py = bx0 + rnd.random() * (bx1 - bx0), by0 + rnd.random() * (by1 - by0)
            inside = False; j = len(poly) - 1
            for i in range(len(poly)):
                xi, yi = poly[i]; xj, yj = poly[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi + 1e-12) + xi:
                    inside = not inside
                j = i
            if inside or (bx1 - bx0 < 6 and by1 - by0 < 6):
                d.ellipse([px - 2.6, py - 2.6, px + 2.6, py + 2.6], fill=(122, 1, 119)); placed += 1
    outlines(d)
    key = [{'css': 'background:rgb(122,1,119);border-radius:50%;width:8px;height:8px', 't': f'One dot = {per} people (2020 Census, placed at random within each block)'}]
    add('people', 'The town in numbers', f'{tot:,} people, and where they live',
        'Antigo holds about four in ten county residents. Elsewhere people cluster around lakes and along the highways; the county forest in the north is almost empty.',
        'Dot-density map of Langlade County population from the 2020 Census: dense in Antigo, sparse in the northern forest, clusters around lakes.',
        'U.S. Census Bureau, 2020 Census redistricting data by census block (P.L. 94-171), TIGER/Line 2020 blocks.', key, save(im, 'people'), town_labels())


def m_jobs():
    jobs = {}
    with gzip.open(f'{RAW}/wac.csv.gz', 'rt') as f:
        for r in csv.DictReader(f):
            if r['w_geocode'].startswith('55067'):
                jobs[r['w_geocode']] = int(r['C000'])
    pts = {}
    for r in dbf_iter(f'{RAW}/tiger/tl_2020_55067_tabblock20.dbf'):
        pts[r['GEOID20']] = (float(r['INTPTLON20']), float(r['INTPTLAT20']))
    im = raster_rgb(base(None, shade=0.22)); d = ImageDraw.Draw(im)
    tot = sum(jobs.values()); anti = 0
    for g, n in sorted(jobs.items(), key=lambda x: -x[1]):
        if g not in pts:
            continue
        x, y = ll(*pts[g]); rr = 2.2 * math.sqrt(n) + 2
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(230, 85, 13, 150), outline=(140, 45, 4), width=2)
    # share inside Antigo city
    from shapely.geometry import shape, Point
    ag = shape(ANTIGO['geometry'])
    anti = sum(n for g, n in jobs.items() if g in pts and ag.contains(Point(*pts[g])))
    outlines(d)
    key = [{'css': 'background:rgb(230,85,13);border-radius:50%;width:10px;height:10px', 't': 'Circle size = number of jobs at that block (biggest about %d)' % max(jobs.values())}]
    add('jobs', 'Who works here', f'{anti / tot * 100:.0f} percent of the county’s jobs are inside Antigo',
        'Jobs are more concentrated than homes: Antigo has about four in ten of the county\u2019s residents but about seven in ten of its jobs.',
        'Map of where jobs are located in Langlade County, by census block: large circles in Antigo, small scattered circles elsewhere.',
        'U.S. Census Bureau, LEHD Origin-Destination Employment Statistics (LODES 8), workplace area characteristics, 2022. Counts are rounded and noise-protected by the Census Bureau.', key, save(im, 'jobs'), town_labels())
    return tot, anti


def m_town_acs(mid, entry, table, col, moecol, classes, colors, fmtv, title, notice, alt, keylabels, unit_note, denom=None, pct_=False):
    A = acs(table); D = acs(denom[0]) if denom else None
    vals, moe, hatch = {}, {}, set()
    for f in COUSUB:
        g = town_geoid(f); r = A.get(g)
        if not r or r.get(col) in (None, '', '-', 'N'):
            continue
        try:
            v = float(r[col]); m = float(r[moecol]) if r.get(moecol) not in (None, '', '-', 'N') else None
        except ValueError:
            continue
        if denom:
            tot = float(D[g][denom[1]]) if D and g in D else 0
            if tot <= 0:
                continue
            v, m = 100 * v / tot, (100 * m / tot if m is not None else None)
        vals[g] = v
        if m is not None:
            moe[g] = m
            if v and (m / 1.645) / v > 0.30:
                hatch.add(g)
    im = choropleth(vals, classes, colors, hatch=hatch); d = ImageDraw.Draw(im)
    outlines(d, antigo=True)
    key = [{'css': sw(c), 't': t} for c, t in zip(colors, keylabels)]
    if hatch:
        key.append({'css': 'background:repeating-linear-gradient(135deg,#bbb 0 3px,#fff 3px 6px)', 't': 'Striped: margin of error is large, read with care'})
    table_rows = town_table(vals, fmtv, moe)
    add(mid, entry, title, notice, alt, unit_note, key, save(im, mid), town_labels(names=['Antigo', 'White Lake', 'Elcho']), table_rows)
    return vals


def m_neighbors():
    vals = {'Vilas': 318.4, 'Oneida': 314.2, 'Marathon': 297.6, 'Shawano': 79.9, 'Lincoln': 76.0, 'Langlade': 60.3, 'Forest': 16.3, 'Menominee': 3.6}
    feats = [f for f in COUNTIES if f['properties']['COUNTY_NAME'] in vals]
    # Vilas is not in the local boundary file; fetch-free fallback: show the counties we have
    xs, ys = [], []
    for f in feats:
        for ring in geo_rings(f['geometry']):
            for lon, lat in ring:
                x, y = TO3071.transform(lon, lat); xs.append(x); ys.append(y)
    c0 = int((min(xs) - X0) / C) - 10; c1 = int((max(xs) - X0) / C) + 10
    r0 = int((YT - max(ys)) / C) - 10; r1 = int((YT - min(ys)) / C) + 10
    fr = frame(r0, r1, c0, c1, 1600)
    im = Image.new('RGB', (fr['w'], fr['h']), PAPER); d = ImageDraw.Draw(im)
    classes = [20, 70, 100, 300, 400]; colors = SEQ5B
    for f in feats:
        v = vals[f['properties']['COUNTY_NAME']]
        i = next(k for k, ub in enumerate(classes) if v <= ub)
        draw_ll_rings(d, f['geometry'], fr, fill=colors[i])
    for f in feats:
        draw_ll_rings(d, f['geometry'], fr, line=(255, 255, 255), width=4)
    draw_ll_rings(d, LANG['geometry'], fr, line=RUST, width=7)
    labels = []
    from shapely.geometry import shape
    for f in feats:
        c = shape(f['geometry']).representative_point()
        x, y = pct(c.x, c.y, fr)
        n = f['properties']['COUNTY_NAME']
        labels.append({'t': f'{n} ${vals[n]:.0f}M', 'x': x, 'y': y, 'k': 'big' if n == 'Langlade' else ''})
    key = [{'css': sw(c), 't': t} for c, t in zip(colors, ['Under $20 million', '$20 to $70 million', '$70 to $100 million', '$100 to $300 million', 'Over $300 million'])]
    have = {f['properties']['COUNTY_NAME'] for f in feats}
    note = '' if 'Vilas' in have else ' Vilas County ($318.4 million) lies just north of Oneida, beyond this map.'
    add('neighbors', 'The neighbors', 'The lake counties to the north draw five times the visitor spending',
        'Langlade (outlined) sits between the lake country of Oneida and Vilas and the farm and forest counties to the south.' + note,
        'Map of direct visitor spending in 2025 for Langlade County and its neighbors; Oneida and Marathon are highest, Langlade in the middle, Forest and Menominee lowest.',
        'Wisconsin Department of Tourism, county economic impact of tourism, 2025 direct visitor spending. Boundaries: Wisconsin DNR.', key, save(im, 'neighbors'), labels)


def m_value():
    # Antigo and its edges: taxable value per acre, averaged over 150 m hexagons (no single property is shown)
    from shapely.geometry import shape
    ag = shape(ANTIGO['geometry']); cx0, cy0 = TO3071.transform(-89.1523, 45.1402)   # downtown Antigo
    x0, y0, x1, y1 = cx0 - 3600, cy0 - 3600, cx0 + 3600, cy0 + 3000
    c0 = int((x0 - X0) / C); c1 = int((x1 - X0) / C); r0 = int((YT - y1) / C); r1 = int((YT - y0) / C)
    fr = frame(r0, r1, c0, c1, 1600)
    base_im = raster_rgb(base(None, shade=0.10), fr)
    HEX = 150.0
    acc = {}
    base_dir = '/home/claude/parcels_raw/V1200_Wisconsin_Parcels_LANGLADE'
    for r, shp in zip(dbf_iter(base_dir + '.dbf'), shp_iter(base_dir + '.shp')):
        try:
            v = float(r['LNDVALUE'] or 0) + float(r['IMPVALUE'] or 0); a = float(r['GISACRES'] or 0)
        except ValueError:
            continue
        if not shp or a <= 0:
            continue
        ring = max(shp, key=len)
        cx = sum(p[0] for p in ring) / len(ring); cy = sum(p[1] for p in ring) / len(ring)
        if not (x0 <= cx <= x1 and y0 <= cy <= y1):
            continue
        q = (cx * 2 / 3) / HEX; rr = (-cx / 3 + math.sqrt(3) / 3 * cy) / HEX
        # axial rounding
        xq, zq = q, rr; yq = -xq - zq
        rx, ry, rz = round(xq), round(yq), round(zq)
        dx, dy, dz = abs(rx - xq), abs(ry - yq), abs(rz - zq)
        if dx > dy and dx > dz: rx = -ry - rz
        elif dy > dz: ry = -rx - rz
        else: rz = -rx - ry
        k = (rx, rz)
        s = acc.setdefault(k, [0.0, 0.0, 0.0])
        if v > 0:
            s[0] += v; s[1] += a
        else:
            s[2] += a
    lay = Image.new('RGBA', base_im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    classes = [10000, 50000, 150000, 400000, 1e12]
    colors = [(255, 255, 204), (161, 218, 180), (65, 182, 196), (34, 94, 168), (12, 44, 132)]
    for (q, rz), (v, a, ex) in acc.items():
        cx = HEX * 1.5 * q; cy = HEX * math.sqrt(3) * (rz + q / 2)
        pts = [xy(cx + HEX * math.cos(math.radians(60 * i)), cy + HEX * math.sin(math.radians(60 * i)), fr) for i in range(6)]
        if a > 0:
            pa = v / a; i = next(k for k, ub in enumerate(classes) if pa <= ub)
            d.polygon(pts, fill=colors[i] + (230,))
        elif ex > 0:
            d.polygon(pts, fill=(200, 196, 188, 200))
    im = Image.alpha_composite(base_im.convert('RGBA'), lay); d = ImageDraw.Draw(im)
    roads(d, fr, color=(90, 84, 76), width=3)
    draw_ll_rings(d, ANTIGO['geometry'], fr, line=RUST, width=6)
    key = [{'css': sw(c), 't': t} for c, t in zip(colors, ['Under $10,000 an acre', '$10,000 to $50,000', '$50,000 to $150,000', '$150,000 to $400,000', 'Over $400,000 an acre'])]
    key.append({'css': sw((200, 196, 188)), 't': 'Tax-exempt (parks, schools, churches, public land)'})
    dx, dy = pct(-89.1523, 45.1402, fr); labels = [{'t': 'Downtown', 'x': dx + 9, 'y': dy - 3, 'k': 'town'}]
    add('value', 'What the town is worth', 'Downtown earns the most tax value per acre',
        'Measured per acre, the blocks of downtown and the older neighborhoods around it carry far more taxable value than the newer edges of town. Each hexagon averages every taxable parcel in it.',
        'Map of taxable value per acre in and around Antigo in 150-metre hexagons: highest downtown and in the older grid of streets, lowest at the edges.',
        'Wisconsin statewide parcels (V12), 2025 assessed land and improvement values, averaged over 150 m hexagons. Assessed values, not equalized; no single property is shown.', key, save(im, 'value'), labels)


def main():
    m_frost(); m_trout(); m_atv(); m_neighbors()
    m_town_acs('seasonal', 'Seasonal homes', 'b25004', 'B25004_E006', 'B25004_M006', [10, 25, 40, 60, 100], SEQ5,
               lambda v: f'{v:.0f}%', 'In the northern towns, most homes are cabins and seasonal places',
               'The share of homes held for seasonal or recreational use climbs from a few percent in Antigo to most of the housing in the lake and forest towns of the north and east.',
               'Map of Langlade County towns by share of homes held for seasonal use: low in Antigo and the south, highest in the northern and eastern towns.',
               ['Under 10%', '10 to 25%', '25 to 40%', '40 to 60%', 'Over 60%'],
               'U.S. Census Bureau, American Community Survey 2020-2024 5-year estimates, tables B25004 and B25001 (seasonal homes as a share of all housing units), by town.',
               denom=('b25001', 'B25001_E001'))
    m_people()
    m_town_acs('age', 'People over time', 'b01002', 'B01002_E001', 'B01002_M001', [42, 48, 54, 60, 120], SEQ5P,
               lambda v: f'{v:.1f}', 'The lake towns are the oldest; Antigo and the farm towns are younger',
               'Half the people in each town are older than the age shown. Retirees in the lake country push the northern towns’ middle age past 55.',
               'Map of median age by town in Langlade County: youngest in Antigo and the farm towns, oldest in the northern lake towns.',
               ['Under 42', '42 to 48', '48 to 54', '54 to 60', 'Over 60'],
               'U.S. Census Bureau, American Community Survey 2020-2024 5-year estimates, table B01002 (median age), by town.')
    m_town_acs('income', 'What households earn', 'b19013', 'B19013_E001', 'B19013_M001', [45000, 55000, 65000, 75000, 1e9], SEQ5B,
               lambda v: f'${v:,.0f}', 'Households in Antigo earn less than in most of the towns around it',
               'These are survey estimates. Small towns have few households in the sample, so many margins of error are wide (striped); read the numbers by town with care.',
               'Map of median household income by town in Langlade County, with stripes on towns whose estimates have a wide margin of error.',
               ['Under $45,000', '$45,000 to $55,000', '$55,000 to $65,000', '$65,000 to $75,000', 'Over $75,000'],
               'U.S. Census Bureau, American Community Survey 2020-2024 5-year estimates, table B19013 (median household income in 2024 dollars), by town.')
    m_jobs(); m_value(); m_elevation(); m_soils_crops(); m_ownership(); m_landcover()
    json.dump(MAPS, open(f'{OUT}/maps.json', 'w'), indent=1, ensure_ascii=False)
    print(len(MAPS), 'maps')


if __name__ == '__main__':
    only = sys.argv[1:]
    if only:
        for n in only:
            globals()['m_' + n]()
        old = json.load(open(f'{OUT}/maps.json')) if os.path.exists(f'{OUT}/maps.json') else []
        ids = {m['id'] for m in MAPS}
        json.dump([m for m in old if m['id'] not in ids] + MAPS, open(f'{OUT}/maps.json', 'w'), indent=1, ensure_ascii=False)
    else:
        main()

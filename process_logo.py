import os
import shutil
from PIL import Image
from collections import deque

source_path = r"C:/Users/ASUS/.gemini/antigravity/brain/b8b75a9f-ad55-47db-8572-1b786be53d7c/.user_uploaded/media_1792582913372_51ac1a16.png"
output_dir = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public/images"
public_root = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public"
os.makedirs(output_dir, exist_ok=True)

orig = Image.open(source_path).convert("RGBA")
w, h = orig.size
bg = (247, 247, 247)

# 1. Filter out all stray compression noise
grid = [[False]*w for _ in range(h)]
for y in range(h):
    for x in range(w):
        r, g, b, _ = orig.getpixel((x, y))
        diff = max(abs(r-247), abs(g-247), abs(b-247))
        if diff >= 3:
            grid[y][x] = True

visited = [[False]*w for _ in range(h)]
valid_mask = [[False]*w for _ in range(h)]

for y in range(h):
    for x in range(w):
        if grid[y][x] and not visited[y][x]:
            cluster = []
            q = deque([(x, y)])
            visited[y][x] = True
            while q:
                cx, cy = q.popleft()
                cluster.append((cx, cy))
                for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                    nx, ny = cx+dx, cy+dy
                    if 0 <= nx < w and 0 <= ny < h and grid[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        q.append((nx, ny))
            if len(cluster) >= 60:
                for px, py in cluster:
                    valid_mask[py][px] = True

# 2. Build logo with given grey color for LEADJEN
def build_logo(grey_rgb, edge_rgb):
    im_out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            if not valid_mask[y][x]:
                continue
            r, g, b, a = orig.getpixel((x, y))
            is_gold = (r > 160 and g > 90 and (r - b) > 30)
            
            if is_gold:
                diff_b = 247 - b
                alpha = min(255, int(diff_b * 1.5))
                if (r - b) > 80: alpha = 255
                if alpha > 255: alpha = 255
                a_norm = max(0.05, alpha / 255.0)
                fg_r = max(0, min(255, int((r - 247 * (1 - a_norm)) / a_norm)))
                fg_g = max(0, min(255, int((g - 247 * (1 - a_norm)) / a_norm)))
                fg_b = max(0, min(255, int((b - 247 * (1 - a_norm)) / a_norm)))
                im_out.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))
            else:
                # LEADJEN and tagline: make color grey
                if r >= 248 and g >= 248 and b >= 248:
                    im_out.putpixel((x, y), (*grey_rgb, 255))
                else:
                    shade = 247 - min(r, g, b)
                    alpha = min(255, int(shade * 7.0))
                    im_out.putpixel((x, y), (*edge_rgb, alpha))
                    
    bbox = im_out.getbbox()
    return im_out.crop(bbox)

# Light theme logo: slate grey #444444 (68, 68, 68) for high contrast on cream
logo_light = build_logo((68, 68, 68), (38, 38, 38))

# Dark theme logo: silver grey #D5D5D5 (213, 213, 213) for high contrast on maroon
logo_dark = build_logo((213, 213, 213), (170, 170, 170))

logo_path = os.path.join(output_dir, "logo.png")
logo_white_path = os.path.join(output_dir, "logo-white.png")
bottom_logo_path = os.path.join(output_dir, "leadjen-bottom-logo.png")
footer_branding_path = os.path.join(output_dir, "footer-branding.png")
root_logo_path = os.path.join(public_root, "logo.png")

logo_light.save(logo_path, "PNG", optimize=True)
logo_dark.save(logo_white_path, "PNG", optimize=True)
logo_dark.save(bottom_logo_path, "PNG", optimize=True)
logo_dark.save(footer_branding_path, "PNG", optimize=True)
logo_light.save(root_logo_path, "PNG", optimize=True)

# Favicon from Arrow
arrow_crop = orig.crop((30, 70, 330, 370))
arrow_clean = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
for y in range(300):
    for x in range(300):
        r, g, b, _ = arrow_crop.getpixel((x, y))
        diff_b = 247 - b
        if r > 160 and g > 90 and diff_b > 25:
            alpha = min(255, int(diff_b * 1.5))
            if (r - b) > 80: alpha = 255
            a_norm = max(0.05, alpha / 255.0)
            fg_r = max(0, min(255, int((r - 247 * (1 - a_norm)) / a_norm)))
            fg_g = max(0, min(255, int((g - 247 * (1 - a_norm)) / a_norm)))
            fg_b = max(0, min(255, int((b - 247 * (1 - a_norm)) / a_norm)))
            arrow_clean.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))

abox = arrow_clean.getbbox()
arrow_cropped = arrow_clean.crop(abox)
aw, ah = arrow_cropped.size
fav_size = max(aw, ah) + 20
square_fav = Image.new("RGBA", (fav_size, fav_size), (0, 0, 0, 0))
ox = (fav_size - aw) // 2
oy = (fav_size - ah) // 2
square_fav.paste(arrow_cropped, (ox, oy), arrow_cropped)

fav48 = square_fav.resize((48, 48), Image.Resampling.LANCZOS)
fav_ico_path = os.path.join(public_root, "favicon.ico")
fav48.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

fav_png_path = os.path.join(output_dir, "favicon.png")
square_fav.resize((64, 64), Image.Resampling.LANCZOS).save(fav_png_path, "PNG")

print("All grey logo assets generated successfully!")

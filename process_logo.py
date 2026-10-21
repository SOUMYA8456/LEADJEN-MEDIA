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
print(f"Source image size: {w}x{h}")

bg = (247, 247, 247)

# 1. Filter out stray compression noise specks
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

# 2. Extract EXACT original colors (no recoloring) with clean alpha
exact_logo = Image.new("RGBA", (w, h), (0, 0, 0, 0))

for y in range(h):
    for x in range(w):
        if not valid_mask[y][x]:
            continue
        r, g, b, a = orig.getpixel((x, y))
        is_gold = (r > 160 and g > 90 and (r - b) > 30)
        
        if is_gold:
            diff_b = 247 - b
            alpha = min(255, int(diff_b * 1.5))
            if (r - b) > 80:
                alpha = 255
            if alpha > 255: alpha = 255
            a_norm = max(0.05, alpha / 255.0)
            fg_r = max(0, min(255, int((r - 247 * (1 - a_norm)) / a_norm)))
            fg_g = max(0, min(255, int((g - 247 * (1 - a_norm)) / a_norm)))
            fg_b = max(0, min(255, int((b - 247 * (1 - a_norm)) / a_norm)))
            exact_logo.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))
        else:
            if r >= 248 and g >= 248 and b >= 248:
                exact_logo.putpixel((x, y), (255, 255, 255, 255))
            else:
                shade = 247 - min(r, g, b)
                alpha = min(255, int(shade * 7.0))
                exact_logo.putpixel((x, y), (r, g, b, alpha))

bbox = exact_logo.getbbox()
cropped = exact_logo.crop(bbox)

logo_path = os.path.join(output_dir, "logo.png")
logo_white_path = os.path.join(output_dir, "logo-white.png")
bottom_logo_path = os.path.join(output_dir, "leadjen-bottom-logo.png")
footer_branding_path = os.path.join(output_dir, "footer-branding.png")
root_logo_path = os.path.join(public_root, "logo.png")

cropped.save(logo_path, "PNG", optimize=True)
cropped.save(logo_white_path, "PNG", optimize=True)
cropped.save(bottom_logo_path, "PNG", optimize=True)
cropped.save(footer_branding_path, "PNG", optimize=True)
cropped.save(root_logo_path, "PNG", optimize=True)

# Favicon
arrow_crop = exact_logo.crop((30, 70, 330, 370))
arrow_clean = arrow_crop.crop(arrow_crop.getbbox())
aw, ah = arrow_clean.size
fav_size = max(aw, ah) + 20
square_fav = Image.new("RGBA", (fav_size, fav_size), (0, 0, 0, 0))
ox = (fav_size - aw) // 2
oy = (fav_size - ah) // 2
square_fav.paste(arrow_clean, (ox, oy), arrow_clean)

fav48 = square_fav.resize((48, 48), Image.Resampling.LANCZOS)
fav_ico_path = os.path.join(public_root, "favicon.ico")
fav48.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

fav_png_path = os.path.join(output_dir, "favicon.png")
square_fav.resize((64, 64), Image.Resampling.LANCZOS).save(fav_png_path, "PNG")

print("All exact logos generated successfully!")

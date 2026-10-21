import os
import shutil
from PIL import Image, ImageFilter

source_path = r"C:/Users/ASUS/.gemini/antigravity/brain/b8b75a9f-ad55-47db-8572-1b786be53d7c/.user_uploaded/media_1792580041848_15fd0dc5.png"
output_dir = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public/images"
public_root = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public"
os.makedirs(output_dir, exist_ok=True)

orig = Image.open(source_path).convert("RGB")
print(f"Original uploaded image size: {orig.size}")

# 1. Precise crop to graphic boundaries
crop_box = (24, 18, 1012, 388)
cropped = orig.crop(crop_box)
w, h = cropped.size
print(f"Cropped graphic size: {w}x{h}")

bg = (247, 247, 247)

# 2. Build masks
raw_mask = Image.new("L", (w, h), 0)
for y in range(h):
    for x in range(w):
        if cropped.getpixel((x, y)) != bg:
            raw_mask.putpixel((x, y), 255)

gold_mask = Image.new("L", (w, h), 0)
text_mask = Image.new("L", (w, h), 0)

for y in range(h):
    for x in range(w):
        if raw_mask.getpixel((x, y)) == 255:
            r, g, b = cropped.getpixel((x, y))
            # Gold/orange has high red, medium-high green, and low blue
            if r > 160 and g > 100 and (r - b) > 40:
                gold_mask.putpixel((x, y), 255)
            else:
                text_mask.putpixel((x, y), 255)

text_smooth = text_mask.filter(ImageFilter.GaussianBlur(radius=0.6))

# Helper to build variant
def build_variant(text_color_main, text_color_tag):
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            r, g, b = cropped.getpixel((x, y))
            if gold_mask.getpixel((x, y)) == 255:
                # Unmultiply gold/orange pixel against background (247, 247, 247)
                diff_b = bg[2] - b
                alpha = min(255, max(0, int(diff_b * 1.5)))
                if (r - b) > 100:
                    alpha = 255
                if alpha > 255:
                    alpha = 255
                if alpha < 20 and (r - b) < 60:
                    continue
                a_norm = alpha / 255.0
                fg_r = max(0, min(255, int((r - bg[0] * (1 - a_norm)) / a_norm)))
                fg_g = max(0, min(255, int((g - bg[1] * (1 - a_norm)) / a_norm)))
                fg_b = max(0, min(255, int((b - bg[2] * (1 - a_norm)) / a_norm)))
                out.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))
            elif text_mask.getpixel((x, y)) == 255 or text_smooth.getpixel((x, y)) > 20:
                alpha = text_smooth.getpixel((x, y))
                if alpha > 120:
                    alpha = min(255, int(alpha * 1.35))
                if alpha < 15:
                    continue
                color = text_color_tag if y > 260 else text_color_main
                out.putpixel((x, y), (*color, alpha))
    return out

# 3. Generate primary logo files
# logo-white.png: Dark backgrounds (maroon drawer, footer, dark mode header)
logo_white = build_variant((255, 255, 255), (255, 255, 255))
logo_white_path = os.path.join(output_dir, "logo-white.png")
logo_white.save(logo_white_path, "PNG", optimize=True)
print(f"Saved: {logo_white_path}")

# logo.png: Light backgrounds (cream website header, editorial pages)
# Deep Maroon (#4A0B1C = (74, 11, 28)) for LEADJEN, (#6B1024 = (107, 16, 36)) for tagline
logo_dark = build_variant((74, 11, 28), (107, 16, 36))
logo_dark_path = os.path.join(output_dir, "logo.png")
logo_dark.save(logo_dark_path, "PNG", optimize=True)
print(f"Saved: {logo_dark_path}")

# leadjen-bottom-logo.png: Crisp white version for maroon footer & mobile drawer bottom
bottom_logo_path = os.path.join(output_dir, "leadjen-bottom-logo.png")
logo_white.save(bottom_logo_path, "PNG", optimize=True)
print(f"Saved: {bottom_logo_path}")

# public/logo.png: Copy for direct root URL accessibility
root_logo_path = os.path.join(public_root, "logo.png")
shutil.copyfile(logo_dark_path, root_logo_path)
print(f"Saved: {root_logo_path}")

# 4. Generate Favicon from the Rocket Arrow mark
arrow_box = (10, 59, 297, 347)
arrow_img = cropped.crop(arrow_box)
aw, ah = arrow_img.size

arrow_rgba = Image.new("RGBA", (aw, ah), (0, 0, 0, 0))
for y in range(ah):
    for x in range(aw):
        r, g, b = arrow_img.getpixel((x, y))
        if r > 160 and g > 100 and (r - b) > 30:
            diff_b = bg[2] - b
            alpha = min(255, max(0, int(diff_b * 1.5)))
            if (r - b) > 100:
                alpha = 255
            if alpha > 255:
                alpha = 255
            if alpha < 20:
                continue
            a_norm = alpha / 255.0
            fg_r = max(0, min(255, int((r - bg[0] * (1 - a_norm)) / a_norm)))
            fg_g = max(0, min(255, int((g - bg[1] * (1 - a_norm)) / a_norm)))
            fg_b = max(0, min(255, int((b - bg[2] * (1 - a_norm)) / a_norm)))
            arrow_rgba.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))

fav_size = max(aw, ah) + 20
square_fav = Image.new("RGBA", (fav_size, fav_size), (0, 0, 0, 0))
ox = (fav_size - aw) // 2
oy = (fav_size - ah) // 2
square_fav.paste(arrow_rgba, (ox, oy), arrow_rgba)

fav48 = square_fav.resize((48, 48), Image.Resampling.LANCZOS)
fav_ico_path = os.path.join(public_root, "favicon.ico")
fav48.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Saved: {fav_ico_path}")

fav_png_path = os.path.join(output_dir, "favicon.png")
square_fav.resize((64, 64), Image.Resampling.LANCZOS).save(fav_png_path, "PNG")
print(f"Saved: {fav_png_path}")

print("All production website logos and icons updated successfully!")

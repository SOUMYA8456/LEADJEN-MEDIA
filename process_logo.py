import os
from PIL import Image, ImageOps

source_path = r"C:/Users/ASUS/.gemini/antigravity/brain/b8b75a9f-ad55-47db-8572-1b786be53d7c/.user_uploaded/media_1788171114465.png"
output_dir = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public/images"
os.makedirs(output_dir, exist_ok=True)

img = Image.open(source_path).convert("RGBA")
print(f"Original image size: {img.size}")

# 1. Calculate bounding box of non-white pixels
# Convert to grayscale to detect ink pixels
gray = img.convert("L")
# Invert so ink is white (> 0) and background is black (0)
inverted = ImageOps.invert(gray)
# Threshold: any pixel darker than 240 is considered part of logo
thresh = inverted.point(lambda p: 255 if p > 15 else 0)
bbox = thresh.getbbox()
print(f"Logo bounding box: {bbox}")

if bbox:
    # Add a small 10px margin around bounding box
    pad = 10
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(img.width, bbox[2] + pad)
    bottom = min(img.height, bbox[3] + pad)
    cropped = img.crop((left, top, right, bottom))
    print(f"Cropped image size: {cropped.size}")

    # Make background transparent:
    # Any near-white pixel (R,G,B > 240) becomes transparent, while black text remains solid
    datas = cropped.getdata()
    newData = []
    newDataWhite = [] # For white logo in dark mode

    for item in datas:
        r, g, b, a = item
        # Luminance
        luminance = int(0.299 * r + 0.587 * g + 0.114 * b)
        
        # Alpha is inverted luminance (darker = more opaque)
        alpha = 255 - luminance
        if alpha < 15:
            # Fully transparent
            newData.append((0, 0, 0, 0))
            newDataWhite.append((255, 255, 255, 0))
        else:
            # Black logo: black RGB with alpha
            newData.append((10, 10, 10, alpha))
            # White logo: white RGB with alpha
            newDataWhite.append((255, 255, 255, alpha))

    logo_transparent = Image.new("RGBA", cropped.size)
    logo_transparent.putdata(newData)
    
    logo_white = Image.new("RGBA", cropped.size)
    logo_white.putdata(newDataWhite)

    # Save master logos
    logo_path = os.path.join(output_dir, "logo.png")
    logo_white_path = os.path.join(output_dir, "logo-white.png")
    logo_transparent.save(logo_path, "PNG", optimize=True)
    logo_white.save(logo_white_path, "PNG", optimize=True)
    print(f"Saved logo: {logo_path}")
    print(f"Saved white logo: {logo_white_path}")

    # Create Favicon / Square Icon
    # Create a 64x64 and 32x32 square favicon
    fav_size = max(cropped.width, cropped.height) + 40
    fav_img = Image.new("RGBA", (fav_size, fav_size), (0, 0, 0, 0))
    # Paste centered
    offset_x = (fav_size - cropped.width) // 2
    offset_y = (fav_size - cropped.height) // 2
    fav_img.paste(logo_transparent, (offset_x, offset_y), logo_transparent)

    fav32 = fav_img.resize((32, 32), Image.Resampling.LANCZOS)
    fav64 = fav_img.resize((64, 64), Image.Resampling.LANCZOS)
    
    fav_png_path = os.path.join(output_dir, "favicon.png")
    fav64.save(fav_png_path, "PNG")
    
    fav_ico_path = r"c:/Users/ASUS/Desktop/LEADJEN MEDIA NEWS/public/favicon.ico"
    fav_img.resize((48, 48), Image.Resampling.LANCZOS).save(fav_ico_path, format="ICO")
    print(f"Saved favicon: {fav_ico_path} and {fav_png_path}")

print("Logo processing completed successfully!")

from PIL import Image

img_path = 'assets/FundoVerdeRestoPreto.jpeg'
out_path = 'assets/FundoVerdeRestoPreto_resized.jpeg'

img = Image.open(img_path).convert('RGB')
# compute average color
pixels = list(img.getdata())
num = len(pixels)
rs = sum(p[0] for p in pixels)
gs = sum(p[1] for p in pixels)
bs = sum(p[2] for p in pixels)
avg_r = rs // num
avg_g = gs // num
avg_b = bs // num
hex_color = '#{:02x}{:02x}{:02x}'.format(avg_r, avg_g, avg_b)

print('HEX_COLOR:', hex_color)

# resize to max width 600 while keeping aspect ratio
max_width = 600
w, h = img.size
if w > max_width:
    new_h = int(h * (max_width / w))
    img2 = img.resize((max_width, new_h), Image.LANCZOS)
else:
    img2 = img.copy()

img2.save(out_path, quality=90)
print('SAVED:', out_path)

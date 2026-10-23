"""Render the portfolio's code-authored social card using its bundled fonts."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
image = Image.new('RGB', (1200, 630), '#183d35')
draw = ImageDraw.Draw(image)
display = ImageFont.truetype(str(root / 'assets/fonts/bodoni-moda-variable.ttf'), 112)
body = ImageFont.truetype(str(root / 'assets/fonts/manrope-variable.ttf'), 26)
small = ImageFont.truetype(str(root / 'assets/fonts/manrope-variable.ttf'), 22)
body.set_variation_by_axes([400])
small.set_variation_by_axes([400])
draw.text((72, 52), 'Jayrald T.', font=body, fill='#9ad5bc')
draw.text((65, 140), 'Jayrald', font=display, fill='#f8f8f4')
draw.text((65, 255), 'Tajanlangit', font=display, fill='#f8f8f4')
draw.text((72, 450), 'Web & mobile development', font=body, fill='#f8f8f4')
draw.text((72, 503), 'Computer Science student', font=small, fill='#cad8d1')
draw.text((1128, 503), 'Philippines', font=small, fill='#cad8d1', anchor='ra')
image.save(root / 'assets/images/social-preview.png', optimize=True)

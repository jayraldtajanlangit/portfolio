"""Prepare an isolated copy of Pulso for capturing its real Flutter UI."""
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
source = root.parent / 'Pulso'
out = root / '.taste-skill' / 'pulso-image-recording'
app = out / 'app'
app.mkdir(parents=True, exist_ok=True)
for name in ('lib', 'web'):
    shutil.copytree(source / name, app / name, dirs_exist_ok=True)
for name in ('pubspec.yaml', 'pubspec.lock'):
    shutil.copy2(source / name, app / name)
shutil.copy2(root / 'scripts' / 'pulso-demo.dart', app / 'lib' / 'portfolio_demo.dart')

# Bundle the SDK's default font so no third-party font requests are needed.
flutter = shutil.which('flutter')
if not flutter:
    raise SystemExit('Flutter must be available on PATH before preparing the capture.')
sdk = Path(flutter).resolve().parents[1]
font = sdk / 'bin/cache/dart-sdk/bin/resources/devtools/assets/packages/devtools_app_shared/fonts/Roboto/Roboto-Regular.ttf'
if not font.exists():
    raise SystemExit(f'Cannot find the Flutter SDK Roboto font: {font}')
(app / 'assets').mkdir(exist_ok=True)
shutil.copy2(font, app / 'assets' / 'Roboto-Regular.ttf')
pubspec = app / 'pubspec.yaml'
text = pubspec.read_text(encoding='utf-8-sig').replace('  uses-material-design: true', '  uses-material-design: true\n  fonts:\n    - family: Roboto\n      fonts:\n        - asset: assets/Roboto-Regular.ttf')
pubspec.write_text(text, encoding='utf-8')

# A clearly fictional initials avatar; the post uses the existing social card.
avatar = Image.new('RGB', (256, 256), '#9ed7c2')
draw = ImageDraw.Draw(avatar)
typeface = ImageFont.truetype(str(root / 'assets/fonts/manrope-variable.ttf'), 90)
draw.text((128, 122), 'JD', font=typeface, fill='#173a31', anchor='mm')
avatar.save(out / 'avatar.png')
print(f'Prepared {app}. Run flutter pub get --offline, then build lib/portfolio_demo.dart for web there.')

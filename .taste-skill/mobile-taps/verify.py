import json, subprocess, re
from pathlib import Path
from PIL import Image, ImageDraw

out = Path('.taste-skill/mobile-taps')
profiles = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {walkthroughMotion} from './scripts/walkthrough-motion.mjs';console.log(JSON.stringify(walkthroughMotion))"], text=True))
results = []
for slug, profile in profiles.items():
    if profile.get('interaction') != 'touch':
        continue
    movie = f'assets/videos/{slug}-polished.mp4'
    # A full-length source comparison detects any added zoom, camera move or cursor.
    comparison = subprocess.run(['ffmpeg', '-hide_banner', '-i', movie, '-i', f'assets/videos/{slug}.webm', '-filter_complex', f"[1:v]trim=start={profile['trim']},setpts=PTS-STARTPTS,fps=60[raw];[0:v][raw]ssim", '-t', str(profile['duration']), '-f', 'null', '-'], capture_output=True, text=True, check=True)
    ssim = float(re.findall(r'All:([\d.]+)', comparison.stderr)[-1])
    assert ssim > .99, (slug, ssim)
    for suffix in ['mp4', 'webm']:
        path = f'assets/videos/{slug}-polished.{suffix}'
        info = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,duration','-of','json',path], text=True))['streams'][0]
        assert (info['width'],info['height'],info['r_frame_rate']) == (390,844,'60/1'), info
    tiles = []
    for index, tap in enumerate(profile['taps']):
        path = out / f'{slug}-tap-{index:02}.png'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(tap['time']+.12),'-i',movie,'-frames:v','1',str(path)],check=True)
        frame = Image.open(path).convert('RGB').resize((195,422))
        tile = Image.new('RGB',(195,452),'#e8eeea');tile.paste(frame,(0,30))
        draw = ImageDraw.Draw(tile);draw.text((4,3),f"{tap['time']:.2f}s {tap['label']}",fill='black')
        tiles.append(tile)
    cols = min(3,len(tiles)); rows = (len(tiles)+cols-1)//cols
    sheet = Image.new('RGB',(cols*195,rows*452),'#e8eeea')
    for index,tile in enumerate(tiles): sheet.paste(tile,((index%cols)*195,(index//cols)*452))
    sheet.save(out/f'{slug}-taps.jpg')
    results.append({'slug':slug,'ssim':ssim,'tapCount':len(tiles),'formats':'MP4 and WebM: 390x844 at 60fps'})
    print(json.dumps(results[-1]),flush=True)
(out/'verification.json').write_text(json.dumps(results,indent=2))

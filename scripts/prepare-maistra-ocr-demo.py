"""Run the project's actual OCR on an anonymous sample for the portfolio capture."""
import csv
import json
import os
from pathlib import Path
import shutil
import sys
import time

sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[1]
source = root.parent / 'mAIstra' / 'ocr_feature'
out = root / '.taste-skill' / 'maistra-ocr-recording'
out.mkdir(parents=True, exist_ok=True)
sample = 'bond/bond_writer1_1.jpg'
shutil.copyfile(source / 'samples' / sample, out / 'handwritten.jpg')
with (source / 'samples' / 'labels.csv').open(encoding='utf-8-sig', newline='') as stream:
    verified = next(row['ground_truth_text'] for row in csv.DictReader(stream) if row['filename'] == sample)
sys.path.insert(0, str(source))
os.environ.setdefault('PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK', 'True')
from core.ocr_pipeline import extract_text_from_image

started = time.monotonic()
result = extract_text_from_image(str(out / 'handwritten.jpg'), output_dir=str(out / 'processing'))
record = {
    'sample': sample,
    'raw_text': result['raw_text'],
    'cleaned_text': result['cleaned_text'],
    'average_confidence': result['average_confidence'],
    'verified_text': verified,
    'extraction_seconds': round(time.monotonic() - started, 2),
}
(out / 'ocr-result.json').write_text(json.dumps(record, indent=2), encoding='utf-8')
print(json.dumps({'sample': sample, 'extraction_seconds': record['extraction_seconds'], 'characters': len(record['cleaned_text'])}))

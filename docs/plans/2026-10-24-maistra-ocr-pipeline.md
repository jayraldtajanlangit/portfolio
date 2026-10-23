# mAIstra OCR pipeline

Extend the existing How it works section with six numbered stages: capture/upload, OpenCV preprocessing, PaddleOCR recognition, reading-order reconstruction and conservative C cleanup, teacher verification, and Judge0 execution/grading. Keep the existing responsive ordered-list layout and captured web walkthrough.

Verified against the local mAIstra README, project overview, OCR pipeline, preprocessing and auto-extraction source. Preprocessing resizes, converts to grayscale and denoises; OCR uses a PP-OCRv6 detector and a fine-tuned recognizer, filters low-confidence detections and reconstructs lines. OCR text stays separate from teacher-verified code. Add Python, FastAPI, OpenCV and PaddleOCR to the project stack, and mention OCR in the homepage summary.

The pipeline describes the team system. Preserve Jayrald's documented web review, grading, Judge0 and Supabase ownership; explicitly attribute mobile capture and OCR to teammates. The existing video demonstrates web review and grading, so its disclosures must not imply it demonstrates extraction or establishes OCR accuracy.

Validation: site generation and all 39 automated tests passed. Six browser checks confirmed the six stages and tools remain readable without horizontal overflow at 390, 768 and 1440px in light and dark themes. Reviewed desktop and phone screenshots show the existing two-column flow becoming a single ordered column on phones. Evidence: `.taste-skill/ocr-pipeline/`.

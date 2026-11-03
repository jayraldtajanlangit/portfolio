"""Update CV wording while preserving the existing Word template package."""
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tmp/pdfs/template-resume/Tajanlangit_CV_template.docx'
TARGET = ROOT / 'output/docx/Jayrald_Tajanlangit_CV.docx'
QA = ROOT / 'tmp/pdfs/cv-content-update'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{' + NS['w'] + '}'

REPLACEMENTS = {
    'EDUCATION': 'Education',
    'UNIVERSITY OF SAN JOSE RECOLETOS': 'University of San Jose-Recoletos',
    'Cebu City': 'Cebu City, 6000 Cebu',
    'BS Computer Science': 'Bachelor of Science in Computer Science',
    'In progress': 'Expected Graduation: June 2027',
    'PROFILE': 'PERSONAL SUMMARY',
    'Computer Science student with hands-on experience building web and mobile applications using Angular, Flutter, Django REST Framework, and Supabase. Interested in a software development internship involving frontend, mobile, or backend development.':
    'Computer Science student at the University of San Jose-Recoletos who builds web and mobile applications with Angular, Flutter, Django REST Framework, and Supabase. Experienced in connecting interfaces, APIs, and databases across individual and team projects. Seeking an internship to contribute to development work and learn through collaboration and code reviews.',
    'Angular | Django REST Framework | SQLite':
    'Angular | Django REST Framework | JWT | SQLite',
    'Built the frontend and backend API for flight search, seat selection, and booking management.':
    'Built the Angular frontend and Django API for flight search, seat selection, add-ons, and booking management.',
    'Implemented the reservation workflow with backend seat validation.':
    'Implemented reservation requests with backend seat validation inside database transactions.',
    'Built the application scaffold, state-management foundation, and authentication.':
    'Built the Flutter application foundation, Riverpod state management, and Supabase authentication.',
    'Developed major social feed, profile, saved-content, and realtime features.':
    'Developed image posting, reactions, saved posts, profiles, and realtime features for the community app.',
    'Supabase | Judge0': 'Angular | TypeScript | Supabase | Judge0',
    'Built the submission review and grading interface for an instructor-facing teaching workflow.':
    'Built the web interface for reviewing handwritten C submissions, verifying OCR output, and recording grades.',
    'Integrated Judge0 code execution and Supabase persistence for review and grading data.':
    'Integrated Judge0 execution and Supabase persistence for submission review and grading.',
    'Designed and built the coaching interface and service-backed chat integration.':
    'Built the Flutter coaching interface and chat integration with FastAPI, Supabase, and Groq.',
    'Designed Tasks and Insights as UI prototypes for the intended accountability workflow.':
    'Designed Tasks and Insights as UI prototypes for planning actions and reviewing progress.',
    'Contributed authentication, location-based discovery, Split Board search, realtime updates, and pickup tools.':
    'Implemented authentication, nearby discovery, Split Board search, realtime updates, and pickup tools.',
    'Git, REST APIs, authentication, realtime updates, Judge0, Groq':
    'Git, REST APIs, JWT, Supabase Realtime, Judge0, Groq',
}

PROJECT_DESCRIPTIONS = {
    20: 'A flight-booking web app for finding flights, choosing seats and add-ons, and managing reservations.',
    25: 'A mobile community app for sharing image posts, reacting to updates, and personalizing profiles.',
    30: 'A teaching system that extracts handwritten C code for teacher review, execution, and grading.',
    35: 'An AI accountability coach that helps users turn coaching conversations into practical next steps.',
    40: 'A mobile app for discovering nearby group buys, reserving a share, and coordinating payment and pickup.',
}

COURSEWORK = (
    'Mobile Development 1, 2 and 3, Software Engineering 1 and 2, '
    'Data Structures and Algorithm, Information Management 1, Operating Systems, '
    'Machine Learning, Applications Development and Emerging Technologies 1 and 2, '
    'Automata Theory and Formal Languages'
)

TARGET.parent.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)
source_hash = sha256(SOURCE.read_bytes()).hexdigest()
with ZipFile(SOURCE) as z:
    doc = E.fromstring(z.read('word/document.xml'))
    body = doc.find('w:body', NS)
    paragraphs = body.findall('w:p', NS)
    changed = []
    for old, new in REPLACEMENTS.items():
        nodes = doc.xpath('.//w:t[text()=$text]', namespaces=NS, text=old)
        assert len(nodes) == 1, (old, len(nodes))
        nodes[0].text = new
        changed.append({'before': old, 'after': new})

    # Match the user's education reference: italic degree and bold coursework label.
    degree_text = paragraphs[8].xpath('./w:r/w:t[text()="Bachelor of Science in Computer Science"]', namespaces=NS)[0]
    degree_run = degree_text.getparent()
    italic_degree = deepcopy(degree_run)
    for child in list(italic_degree):
        if child.tag != W + 'rPr':
            italic_degree.remove(child)
    E.SubElement(italic_degree.find('w:rPr', NS), W + 'i')
    E.SubElement(italic_degree, W + 't').text = degree_text.text
    degree_run.remove(degree_text)
    paragraphs[8].insert(paragraphs[8].index(degree_run), italic_degree)
    coursework = paragraphs[9]
    coursework.remove(coursework.find('w:pPr', NS))
    coursework.insert(0, deepcopy(paragraphs[21].find('w:pPr', NS)))
    for child in list(coursework):
        if child.tag != W + 'pPr':
            coursework.remove(child)
    for text, bold in [('Relevant Coursework: ', True), (COURSEWORK, False)]:
        run = deepcopy(paragraphs[14].find('w:r', NS))
        run.find('w:t', NS).text = text
        if bold:
            E.SubElement(run.find('w:rPr', NS), W + 'b')
        coursework.append(run)

    # Bulk Buying has a distinct stack from the Pulso entry above it.
    stack = paragraphs[40].find('.//w:t', NS)
    assert stack.text == 'Flutter | Riverpod | Supabase'
    stack.text = 'Flutter | Supabase | Realtime | Geolocation'

    # Reuse the existing bullet and skills-row components without changing style.
    bullet = deepcopy(paragraphs[41])
    bullet.find('.//w:t', NS).text = (
        'Built purchase history, reporting, and on-device barcode features; receipt OCR was team work.'
    )
    body.insert(body.index(paragraphs[41]) + 1, bullet)
    languages = deepcopy(paragraphs[46])
    nodes = languages.findall('.//w:t', NS)
    assert len(nodes) == 2
    nodes[0].text = 'Languages: '
    nodes[1].text = 'TypeScript, Dart, Python'
    body.insert(body.index(paragraphs[46]), languages)
    inserted = [bullet, languages]

    # Describe each product separately from the developer's contribution bullets.
    for stack_index, text in PROJECT_DESCRIPTIONS.items():
        description = deepcopy(paragraphs[stack_index])
        nodes = description.findall('.//w:t', NS)
        assert len(nodes) == 1
        nodes[0].text = text
        body.insert(body.index(paragraphs[stack_index]) + 1, description)
        inserted.append(description)
    inserted_indices = {body.index(p) for p in inserted}

    updates = {'word/document.xml': E.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)}
    with ZipFile(TARGET, 'w') as out:
        for info in z.infolist():
            out.writestr(info, updates.get(info.filename, z.read(info.filename)))

with ZipFile(SOURCE) as a, ZipFile(TARGET) as b:
    untouched = [n for n in a.namelist() if n not in updates]
    assert all(a.read(n) == b.read(n) for n in untouched)
    before = E.fromstring(a.read('word/document.xml'))
    after = E.fromstring(b.read('word/document.xml'))
    assert E.tostring(before.find('w:body/w:sectPr', NS)) == E.tostring(after.find('w:body/w:sectPr', NS))
    assert E.tostring(before.find('w:body/w:p', NS)) == E.tostring(after.find('w:body/w:p', NS))
    # All original paragraph properties remain unchanged and in the same order.
    original_properties = [E.tostring(p.find('w:pPr', NS)) if p.find('w:pPr', NS) is not None else None for p in before.findall('w:body/w:p', NS)]
    final_paragraphs = after.findall('w:body/w:p', NS)
    final_without_insertions = [p for i, p in enumerate(final_paragraphs) if i not in inserted_indices]
    final_properties = [E.tostring(p.find('w:pPr', NS)) if p.find('w:pPr', NS) is not None else None for p in final_without_insertions]
    assert len(original_properties) == len(final_properties)
    assert all(a == b for i, (a, b) in enumerate(zip(original_properties, final_properties)) if i != 9)
    assert sha256(SOURCE.read_bytes()).hexdigest() == source_hash
    (QA / 'content-and-fidelity.json').write_text(json.dumps({
        'source': str(SOURCE), 'source_sha256': source_hash,
        'output': str(TARGET), 'preserved_package_parts': len(untouched),
        'changed_package_parts': list(updates), 'original_paragraph_styles_preserved_except': ['Education coursework bullet requested in reference'],
        'name_contacts_and_page_geometry_preserved': True, 'replacements': changed,
        'added': ['One Bulk Buying contribution bullet', 'One programming languages row', 'Five project descriptions'],
        'project_descriptions': list(PROJECT_DESCRIPTIONS.values()),
        'education_coursework': COURSEWORK,
        'expected_graduation': 'June 2027',
    }, indent=2), encoding='utf-8')
print(TARGET)
print(f'Preserved {len(untouched)} package parts; coursework formatting follows the supplied reference')

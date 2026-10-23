from pathlib import Path
from zipfile import ZipFile
from copy import deepcopy
from lxml import etree as E
import hashlib, json

task = Path(__file__).resolve().parent
source = Path(r'C:\Users\Jayrald\Desktop\Tajalangit_CV.docx')
target = task / 'Tajanlangit_CV_template.docx'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '3f902210bdccd3f4597de12d6dbc1076f1b52b84ff213e9e8feeac48f1f0177a'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PR = 'http://schemas.openxmlformats.org/package/2006/relationships'
ns = {'w': W}
q = lambda name: '{' + W + '}' + name
with ZipFile(source) as z:
    root = E.fromstring(z.read('word/document.xml'))
    body = root.find('w:body', ns)
    ps = list(body.findall('w:p', ns))
    section = deepcopy(body.find('w:sectPr', ns))
    relationships = E.fromstring(z.read('word/_rels/document.xml.rels'))
    normal = deepcopy(ps[7].find('w:r/w:rPr', ns))
    bold = deepcopy(ps[17].find('w:r/w:rPr', ns))
    link_counter = 100
    paragraph_counter = 100

    def paragraph(index, segments):
        global paragraph_counter, link_counter
        result = deepcopy(ps[index])
        for child in list(result):
            if child.tag != q('pPr'):
                result.remove(child)
        paragraph_counter += 1
        for attr in list(result.attrib):
            if attr.endswith('paraId') or attr.endswith('textId'):
                result.set(attr, f'{paragraph_counter:08X}')
        for value, kind, *url in segments:
            run = E.Element(q('r'))
            if kind == 'source':
                properties = ps[index].find('w:r/w:rPr', ns)
            else:
                properties = bold if kind == 'bold' else normal
            if properties is not None:
                run.append(deepcopy(properties))
            chunks = value.split('\t')
            for i, chunk in enumerate(chunks):
                if i:
                    E.SubElement(run, q('tab'))
                text = E.SubElement(run, q('t'))
                text.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                text.text = chunk
            if url:
                link_counter += 1
                rid = f'rId{link_counter}'
                E.SubElement(relationships, '{' + PR + '}Relationship', Id=rid, Type=R + '/hyperlink', Target=url[0], TargetMode='External')
                hyperlink = E.Element(q('hyperlink'), {'{' + R + '}id': rid})
                hyperlink.append(run)
                result.append(hyperlink)
            else:
                result.append(run)
        return result

    content = [deepcopy(ps[0])]
    content.append(paragraph(1, [
        ('Cebu, Philippines | +63 995 351 8945 | ', 'source'),
        ('jayraldtajanlangit123@gmail.com', 'source', 'mailto:jayraldtajanlangit123@gmail.com'),
    ]))
    content.append(paragraph(1, [
        ('github.com/jayraldtajanlangit', 'source', 'https://github.com/jayraldtajanlangit'),
        (' | ', 'source'),
        ('LinkedIn', 'source', 'https://www.linkedin.com/in/jayrald-tajanlangit-b8646a280/'),
    ]))

    def gap(index=10): content.append(deepcopy(ps[index]))
    def heading(index, title):
        content.append(paragraph(index, [(title, 'source')]))
        gap(4)
        gap(5)

    gap(2)
    heading(3, 'EDUCATION')
    content.append(paragraph(6, [('UNIVERSITY OF SAN JOSE RECOLETOS', 'bold'), ('\tCebu City', 'plain')]))
    content.append(paragraph(7, [('BS Computer Science\tIn progress', 'plain')]))
    content.append(paragraph(9, [('Relevant Coursework: Data Structures & Algorithms, Software Engineering, Operating Systems, Database Systems, Web & Mobile Development', 'plain')]))
    gap()
    heading(14, 'PROFILE')
    content.append(paragraph(54, [('Computer Science student with hands-on experience building web and mobile applications using Angular, Flutter, Django REST Framework, and Supabase. Interested in a software development internship involving frontend, mobile, or backend development.', 'plain')]))
    gap()
    heading(28, 'PROJECTS')

    projects = [
        ('SKYFIRE', 'Individual project', 'Angular | Django REST Framework | SQLite', None, [
            'Built the frontend and backend API for flight search, seat selection, and booking management.',
            'Implemented the reservation workflow with backend seat validation.',
        ]),
        ('PULSO', 'Team project', 'Flutter | Riverpod | Supabase', 'https://github.com/jayraldtajanlangit/Pulso', [
            'Built the application scaffold, state-management foundation, and authentication.',
            'Developed major social feed, profile, saved-content, and realtime features.',
        ]),
        ('mAIstra', 'Team project', 'Supabase | Judge0', 'https://github.com/Francismarcnikko123/mAIstra/tree/judge0-integration', [
            'Built the submission review and grading interface for an instructor-facing teaching workflow.',
            'Integrated Judge0 code execution and Supabase persistence for review and grading data.',
        ]),
        ('SIGE', 'Individual project', 'Flutter | Supabase | FastAPI | Groq', 'https://github.com/jayraldtajanlangit/sige', [
            'Designed and built the coaching interface and service-backed chat integration.',
            'Designed Tasks and Insights as UI prototypes for the intended accountability workflow.',
        ]),
        ('BULK BUYING COMPANION', 'Team project', 'Flutter | Riverpod | Supabase', None, [
            'Contributed authentication, location-based discovery, Split Board search, realtime updates, and pickup tools.',
        ]),
    ]
    for index, (name, ownership, stack, url, bullets) in enumerate(projects):
        if index: gap(22)
        title = (name, 'bold', url) if url else (name, 'bold')
        # Short titles need to pass the template's first left tab to reach its right-aligned metadata stop.
        separator = '\t' if name == 'BULK BUYING COMPANION' else '\t\t'
        content.append(paragraph(17, [title, (separator + ownership, 'plain')]))
        content.append(paragraph(18, [(stack, 'plain')]))
        for bullet in bullets:
            content.append(paragraph(19, [(bullet, 'plain')]))
    gap()
    heading(51, 'TECHNICAL SKILLS')
    for label, text in [
        ('Web and Mobile', 'Angular, Flutter, Riverpod'),
        ('Backend and Data', 'Django REST Framework, FastAPI, Supabase, SQLite'),
        ('Tools and Integrations', 'Git, REST APIs, authentication, realtime updates, Judge0, Groq'),
    ]:
        content.append(paragraph(54, [(label + ': ', 'bold'), (text, 'plain')]))
    for child in list(body): body.remove(child)
    body.extend(content)
    body.append(section)

    updates = {
        'word/document.xml': E.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True),
        'word/_rels/document.xml.rels': E.tostring(relationships, xml_declaration=True, encoding='UTF-8', standalone=True),
    }
    with ZipFile(target, 'w') as out:
        for info in z.infolist():
            out.writestr(info, updates.get(info.filename, z.read(info.filename)))

with ZipFile(source) as before, ZipFile(target) as after:
    preserved = [name for name in before.namelist() if name not in updates]
    assert all(before.read(name) == after.read(name) for name in preserved)
    final_root = E.fromstring(after.read('word/document.xml'))
    assert E.tostring(final_root.find('.//w:sectPr', ns)) == E.tostring(E.fromstring(before.read('word/document.xml')).find('.//w:sectPr', ns))
    text = ''.join(final_root.xpath('.//w:t/text()', namespaces=ns))
    assert '\ufffd' not in text
    assert all(name in text for name in ['SKYFIRE', 'PULSO', 'mAIstra', 'SIGE', 'BULK BUYING COMPANION'])
    assert 'TECHSTART' not in text and '50,000' not in text
    audit = {'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'preserved_parts': len(preserved), 'changed_parts': list(updates), 'section_geometry_preserved': True, 'all_five_projects': True}
    (task / 'fidelity-audit.json').write_text(json.dumps(audit, indent=2))
print(target)
print('Preserved all', len(preserved), 'untouched package parts and source page geometry')

"""Generate the downloadable scenario PDFs from the same data used by the reader.

Requires reportlab, pypdf and pypdfium2 for generation and verification.
Use local CJK fonts, or set SHIJU_SONG_FONT and SHIJU_HEI_FONT.
"""
import json
import os
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'lib/job-documents.json').read_text(encoding='utf-8'))
pdfmetrics.registerFont(TTFont('Song', os.environ.get('SHIJU_SONG_FONT', 'C:/Windows/Fonts/simsun.ttc'), subfontIndex=0))
pdfmetrics.registerFont(TTFont('Hei', os.environ.get('SHIJU_HEI_FONT', 'C:/Windows/Fonts/simhei.ttf')))
out = root / 'public/documents'
preview = root / 'docs/simulation-refined'
out.mkdir(parents=True, exist_ok=True)
preview.mkdir(parents=True, exist_ok=True)
style = ParagraphStyle('body', fontName='Song', fontSize=11.5, leading=22, firstLineIndent=23, wordWrap='CJK', textColor='#252b26')
width, height = A4
for mode, doc in data.items():
    path = out / ('job-' + mode + '.pdf')
    pdf = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    pdf.setTitle(doc['file'])
    pdf.setAuthor('识局 · 教学模拟')
    margin = 58
    pdf.setFont('Hei', 14)
    pdf.drawCentredString(width / 2, height - 58, doc['org'])
    pdf.setFont('Song', 9)
    pdf.setFillColorRGB(.43, .46, .43)
    pdf.drawCentredString(width / 2, height - 80, doc['code'] + ' · ' + ('岗前培训说明' if mode == 'learning' else '入职办理通知'))
    pdf.setFillColorRGB(.12, .15, .12)
    pdf.setFont('Hei', 19)
    pdf.drawCentredString(width / 2, height - 122, doc['title'])
    pdf.setStrokeColorRGB(.72, .75, .71)
    pdf.setLineWidth(.5)
    pdf.line(margin, height - 142, width - margin, height - 142)
    pdf.setFont('Song', 10)
    pdf.drawString(margin, height - 163, '适用岗位：' + doc['role'])
    pdf.drawRightString(width - margin, height - 163, '联系人员：' + doc['contact'])
    y = height - 200
    for heading, text in doc['sections']:
        pdf.setFont('Hei', 12)
        pdf.drawString(margin, y, heading)
        paragraph = Paragraph(text, style)
        _, h = paragraph.wrap(width - 2 * margin, height)
        paragraph.drawOn(pdf, margin, y - 10 - h)
        y -= h + 36
    assert y > 115, (mode, y)
    pdf.setFont('Song', 11)
    pdf.drawRightString(width - margin, y - 9, doc['org'])
    pdf.drawRightString(width - margin, y - 31, '情境日期：2026年11月17日')
    pdf.line(margin, 52, width - margin, 52)
    pdf.setFont('Song', 7)
    pdf.drawString(margin, 38, '识局 · 教学模拟材料 / 机构、岗位与人物均为虚构')
    pdf.drawRightString(width - margin, 38, '- 1 -')
    pdf.save()
    reader = PdfReader(path)
    assert len(reader.pages) == 1
    extracted = reader.pages[0].extract_text()
    for term in [doc['code'], doc['contact'], doc['title'], '教学模拟材料', '298元' if mode == 'learning' else '屏幕共享']:
        assert term in extracted, (mode, term)
    rendered = pdfium.PdfDocument(path)
    rendered[0].render(scale=1.5).to_pil().save(preview / (mode + '-pdf.png'))
    print(mode, 'one-page PDF verified:', path)

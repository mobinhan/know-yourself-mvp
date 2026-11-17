"""ReportLab renderer for the Know Yourself Uranus Opposition master layout."""
from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    HRFlowable, Flowable,
)

BLUE = colors.HexColor("#173A56")
BODY = colors.HexColor("#263746")
MUTED = colors.HexColor("#66737D")
RULE = colors.HexColor("#D7DEE3")
PALE = colors.HexColor("#F3F5F6")
WHITE = colors.white
PAGE_W, PAGE_H = A4
LEFT = RIGHT = 22.2 * mm
TOP = 21.5 * mm
BOTTOM = 20 * mm
FOOTER_Y = 9 * mm


def _fonts():
    regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    italic = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"
    if all(Path(p).exists() for p in (regular, bold, italic)):
        pdfmetrics.registerFont(TTFont("KY-DejaVu", regular))
        pdfmetrics.registerFont(TTFont("KY-DejaVu-Bold", bold))
        pdfmetrics.registerFont(TTFont("KY-DejaVu-Italic", italic))
        pdfmetrics.registerFontFamily("KY-DejaVu", normal="KY-DejaVu",
                                      bold="KY-DejaVu-Bold",
                                      italic="KY-DejaVu-Italic",
                                      boldItalic="KY-DejaVu-Bold")
        return "KY-DejaVu", "KY-DejaVu-Bold", "KY-DejaVu-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT, FONT_BOLD, FONT_ITALIC = _fonts()
S = getSampleStyleSheet()
S.add(ParagraphStyle("KYChapter", fontName=FONT_BOLD, fontSize=20, leading=25,
                     textColor=BLUE, spaceAfter=10, keepWithNext=True))
S.add(ParagraphStyle("KYSubhead", fontName=FONT_BOLD, fontSize=13, leading=17,
                     textColor=BLUE, spaceBefore=7, spaceAfter=7, keepWithNext=True))
S.add(ParagraphStyle("KYBody", fontName=FONT, fontSize=9.4, leading=15.2,
                     textColor=BODY, alignment=TA_LEFT, spaceAfter=8.5,
                     allowWidows=0, allowOrphans=0))
S.add(ParagraphStyle("KYQuote", fontName=FONT_ITALIC, fontSize=12, leading=18,
                     textColor=BLUE, leftIndent=12*mm, rightIndent=8*mm,
                     spaceBefore=5, spaceAfter=13))
S.add(ParagraphStyle("KYSmall", fontName=FONT, fontSize=7.2, leading=9.5,
                     textColor=MUTED))
S.add(ParagraphStyle("KYTable", fontName=FONT, fontSize=7.6, leading=10.2,
                     textColor=BODY))
S.add(ParagraphStyle("KYTableHead", fontName=FONT_BOLD, fontSize=7.6,
                     leading=10.2, textColor=WHITE))
S.add(ParagraphStyle("KYCoverTitle", fontName=FONT_BOLD, fontSize=28,
                     leading=34, textColor=BLUE, alignment=TA_CENTER))
S.add(ParagraphStyle("KYCoverMeta", fontName=FONT, fontSize=12, leading=18,
                     textColor=MUTED, alignment=TA_CENTER))
S.add(ParagraphStyle("KYLayerLabel", fontName=FONT_BOLD, fontSize=7.4,
                     leading=9, textColor=BLUE, alignment=TA_CENTER))


def _p(value: Any, style: str = "KYBody") -> Paragraph:
    # Generated narrative is plain text. Escape it so markup cannot be injected.
    return Paragraph(escape(str(value)).replace("\n", "<br/>"), S[style])


class _Layers(Flowable):
    def __init__(self, layers: dict, width: float):
        super().__init__()
        self.layers, self.width, self.height = layers, width, 82

    def draw(self):
        gap = 8
        colw = (self.width - 2 * gap) / 3
        for i, (label, key) in enumerate((("NATAL", "natal"),
                                          ("CYCLE", "cycle"),
                                          ("COMBINED", "combined"))):
            x = i * (colw + gap)
            self.canv.setStrokeColor(RULE)
            self.canv.setFillColor(colors.HexColor("#FAFBFB"))
            self.canv.roundRect(x, 0, colw, self.height, 5, stroke=1, fill=1)
            self.canv.setFillColor(BLUE)
            self.canv.setFont(FONT_BOLD, 7.4)
            self.canv.drawCentredString(x + colw/2, self.height - 15, label)
            item = self.layers.get(key, {})
            self.canv.setFillColor(BODY)
            self.canv.setFont(FONT_BOLD, 7.5)
            self.canv.drawCentredString(x + colw/2, self.height - 34,
                                        str(item.get("headline", ""))[:48])
            self.canv.setFillColor(MUTED)
            self.canv.setFont(FONT, 7.1)
            for j, line in enumerate(str(item.get("subline", "")).split("\n")[:3]):
                self.canv.drawCentredString(x + colw/2, self.height - 49 - 10*j, line[:54])


def _table(block: dict, width: float):
    headers, rows = block.get("headers", []), block.get("rows", [])
    if not headers:
        raise ValueError("Table block requires headers.")
    data = [[_p(x, "KYTableHead") for x in headers]]
    for row in rows:
        if len(row) != len(headers):
            raise ValueError("Table row width does not match its header.")
        data.append([_p(x, "KYTable") for x in row])
    widths = block.get("widths")
    widths = [float(x) * width for x in widths] if widths else None
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, -1), 0.35, RULE),
    ]
    for ri in range(2, len(data), 2):
        commands.append(("BACKGROUND", (0, ri), (-1, ri), PALE))
    table.setStyle(TableStyle(commands))
    return table


def _block(block: dict, width: float):
    kind = block.get("type")
    if kind == "paragraph":
        return _p(block.get("text", ""))
    if kind == "subheading":
        return _p(block.get("text", ""), "KYSubhead")
    if kind == "quote":
        return _p(block.get("text", ""), "KYQuote")
    if kind == "note":
        return _p(block.get("text", ""), "KYSmall")
    if kind == "table":
        return _table(block, width)
    if kind == "layers":
        return _Layers(block.get("layers", {}), width)
    if kind == "rule":
        return HRFlowable(width="100%", thickness=.5, color=RULE,
                          spaceBefore=5, spaceAfter=9)
    raise ValueError(f"Unsupported report block type: {kind!r}")


def validate_report(data: dict):
    if data.get("validation_warnings"):
        raise ValueError("Report blocked: unresolved validation warnings.")
    if data.get("evidence_status", {}).get("locked") is not True:
        raise ValueError("Report blocked: deterministic evidence is not locked.")
    chapters = data.get("chapters")
    if not isinstance(chapters, list) or len(chapters) != 15:
        raise ValueError("Uranus Opposition report requires exactly 15 chapters.")
    for index, chapter in enumerate(chapters, 1):
        if not chapter.get("id") or not chapter.get("title"):
            raise ValueError(f"Chapter {index} is missing its ID or title.")
        blocks = chapter.get("blocks")
        if not isinstance(blocks, list) or not blocks:
            raise ValueError(f"Chapter {index} has no substantive content.")
        if not any(str(b.get("text", "")).strip() for b in blocks if b.get("type") in ("paragraph", "quote")):
            raise ValueError(f"Chapter {index} has no readable narrative text.")


def _footer(canvas, doc):
    if doc.page <= 1:
        return
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(.45)
    canvas.line(LEFT, FOOTER_Y + 5*mm, PAGE_W - RIGHT, FOOTER_Y + 5*mm)
    canvas.setFont(FONT, 6.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(LEFT, FOOTER_Y, "KNOW YOURSELF  ·  HUMAN DESIGN LIFE CYCLE")
    canvas.drawRightString(PAGE_W - RIGHT, FOOTER_Y, str(doc.page))
    canvas.restoreState()


def render_uranus_opposition_pdf(data: dict, output_path: str | Path) -> Path:
    validate_report(data)
    doc = SimpleDocTemplate(
        str(output_path), pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT,
        topMargin=TOP, bottomMargin=BOTTOM,
        title=f"{data.get('title', 'The Uranus Opposition')} — {data.get('client_name', '')}",
        author="Know Yourself", subject="Personal Human Design life-cycle reading",
        pageCompression=1,
    )
    width = PAGE_W - LEFT - RIGHT
    story = [Spacer(1, 66*mm), _p(data.get("title", "The Uranus Opposition"), "KYCoverTitle"),
             Spacer(1, 7*mm), _p(data.get("subtitle", "A personal Human Design life-cycle reading"), "KYCoverMeta"),
             Spacer(1, 35*mm), _p(data.get("designation", "A PERSONAL HUMAN DESIGN LIFE-CYCLE READING"), "KYCoverMeta"),
             Spacer(1, 15*mm)]
    birth = data.get("birth", {})
    story += [_p(birth.get("date_time", ""), "KYCoverMeta"),
              _p(birth.get("place", ""), "KYCoverMeta"),
              Spacer(1, 10*mm),
              _p(data.get("cycle_period", ""), "KYCoverMeta"),
              Spacer(1, 35*mm),
              _p("KNOW YOURSELF · HUMAN DESIGN LIFE CYCLE", "KYCoverMeta"),
              PageBreak()]
    intro = data.get("introduction", {})
    if intro:
        story.append(_p(intro.get("heading", data.get("subtitle", "")), "KYChapter"))
        for paragraph in intro.get("paragraphs", []):
            story.append(_p(paragraph))
        if intro.get("pull_quote"):
            story.append(_p(intro["pull_quote"], "KYQuote"))
        if intro.get("how_to_read_heading"):
            story.append(_p(intro["how_to_read_heading"], "KYSubhead"))
        if intro.get("how_to_read"):
            story.append(_p(intro["how_to_read"]))
        if intro.get("layers"):
            story.extend([Spacer(1, 4*mm), _Layers(intro["layers"], width)])
        if intro.get("closing_note"):
            story.extend([Spacer(1, 4*mm), _p(intro["closing_note"], "KYSmall")])
    story.append(PageBreak())
    for i, chapter in enumerate(data["chapters"], 1):
        story.append(_p(f"{i}. {chapter['title']}", "KYChapter"))
        if chapter.get("subtitle"):
            story.append(_p(chapter["subtitle"], "KYSubhead"))
        for block in chapter["blocks"]:
            story.append(_block(block, width))
        if i < 15:
            story.append(PageBreak())
    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return Path(output_path)

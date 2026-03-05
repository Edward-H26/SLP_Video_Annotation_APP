from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def formatTimestamp(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def formatTimestampSimple(seconds: float) -> str:
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"


def exportAsJson(segments: list, annotations: list) -> dict:
    return {
        "segments": segments,
        "annotations": annotations
    }


def exportAsSrt(segments: list) -> str:
    lines = []
    for i, segment in enumerate(segments, 1):
        start = formatTimestamp(segment.get("start", 0))
        end = formatTimestamp(segment.get("end", 0))
        text = segment.get("text", "")
        speaker = segment.get("speaker", "")
        prefix = f"{speaker}: " if speaker else ""
        lines.append(f"{i}")
        lines.append(f"{start} --> {end}")
        lines.append(f"{prefix}{text}")
        lines.append("")
    return "\n".join(lines)


def exportAsTxt(segments: list, annotations: list) -> str:
    lines = ["TRANSCRIPT", "=" * 40, ""]
    for segment in segments:
        timestamp = formatTimestampSimple(segment.get("start", 0))
        speaker = segment.get("speaker", "")
        prefix = f"[{speaker}] " if speaker else ""
        lines.append(f"[{timestamp}] {prefix}{segment.get('text', '')}")

    if annotations:
        lines.extend(["", "", "ANNOTATIONS", "=" * 40, ""])
        for annotation in sorted(annotations, key=lambda a: a.get("timestamp", 0)):
            timestamp = formatTimestampSimple(annotation.get("timestamp", 0))
            annotationType = annotation.get("type", "note")
            content = annotation.get("content", "")
            tags = annotation.get("tags", [])
            tagStr = f" [{', '.join(tags)}]" if tags else ""
            lines.append(f"[{timestamp}] ({annotationType}){tagStr} {content}")

    return "\n".join(lines)


def exportAsPdf(segments: list, annotations: list) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    baseStyles = getSampleStyleSheet()
    elements = []

    titleStyle = ParagraphStyle(
        "CustomTitle",
        parent=baseStyles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=12
    )
    headingStyle = ParagraphStyle(
        "CustomHeading",
        parent=baseStyles["Normal"],
        fontSize=14,
        textColor=colors.HexColor("#16213e"),
        spaceBefore=12,
        spaceAfter=6,
        fontName="Helvetica-Bold"
    )
    bodyStyle = ParagraphStyle(
        "CustomBody",
        parent=baseStyles["Normal"],
        fontSize=10,
        leading=14,
        spaceBefore=4
    )
    elements.append(Paragraph("Video Transcription Report", titleStyle))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Transcript", headingStyle))
    elements.append(Spacer(1, 6))

    for segment in segments:
        timestamp = formatTimestampSimple(segment.get("start", 0))
        speaker = segment.get("speaker", "")
        prefix = f"<b>[{speaker}]</b> " if speaker else ""
        elements.append(Paragraph(f"<font color='#6c757d'>[{timestamp}]</font> {prefix}{segment.get('text', '')}", bodyStyle))

    if annotations:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Annotations", headingStyle))
        elements.append(Spacer(1, 6))
        for annotation in sorted(annotations, key=lambda a: a.get("timestamp", 0)):
            timestamp = formatTimestampSimple(annotation.get("timestamp", 0))
            annotationType = annotation.get("type", "note")
            content = annotation.get("content", "")
            tags = annotation.get("tags", [])
            tagStr = f" [{', '.join(tags)}]" if tags else ""
            elements.append(Paragraph(
                f"<font color='#6c757d'>[{timestamp}]</font> <b>({annotationType})</b>{tagStr} {content}",
                bodyStyle
            ))

    doc.build(elements)
    buffer.seek(0)
    return buffer

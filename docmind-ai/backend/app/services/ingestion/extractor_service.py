"""
Text extraction service.

One private `_extract_*` method per supported format. Deliberately returns
plain extracted text and nothing else — no chunking, no page-boundary
metadata, no embeddings. Milestone 4 is what turns this raw text into
retrieval-ready chunks; this service's only job is "bytes on disk -> text".
"""
from pathlib import Path

import fitz  # PyMuPDF
from docx import Document as DocxDocument
from pptx import Presentation

from app.core.exceptions import ExtractionFailedException

_EXTRACTORS = {}  # populated by _register, see bottom of file


class ExtractionService:
    def extract(self, file_path: str, file_extension: str) -> str:
        extractor = _EXTRACTORS.get(file_extension)
        if extractor is None:
            raise ExtractionFailedException(
                f"No text extractor is registered for '{file_extension}' files."
            )
        try:
            text = extractor(file_path).strip()
        except Exception as exc:  # noqa: BLE001 - any parser failure becomes a domain error
            raise ExtractionFailedException(
                f"Failed to extract text from this {file_extension} file: {exc}"
            ) from exc

        if not text:
            raise ExtractionFailedException(
                "No extractable text was found in this document "
                "(it may be a scanned/image-only file)."
            )
        return text

    @staticmethod
    def _extract_pdf(file_path: str) -> str:
        with fitz.open(file_path) as pdf:
            return "\n".join(page.get_text() for page in pdf)

    @staticmethod
    def _extract_docx(file_path: str) -> str:
        document = DocxDocument(file_path)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    @staticmethod
    def _extract_pptx(file_path: str) -> str:
        presentation = Presentation(file_path)
        text_parts: list[str] = []
        for slide in presentation.slides:
            for shape in slide.shapes:
                if shape.has_text_frame:
                    text_parts.append(shape.text_frame.text)
        return "\n".join(text_parts)

    @staticmethod
    def _extract_txt(file_path: str) -> str:
        return Path(file_path).read_text(encoding="utf-8")


_EXTRACTORS[".pdf"] = ExtractionService._extract_pdf
_EXTRACTORS[".docx"] = ExtractionService._extract_docx
_EXTRACTORS[".pptx"] = ExtractionService._extract_pptx
_EXTRACTORS[".txt"] = ExtractionService._extract_txt

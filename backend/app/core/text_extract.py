from io import BytesIO
from docx import Document

from fastapi import HTTPException, UploadFile
from pdfminer.high_level import extract_text

def extract_text_from_upload(file: UploadFile, file_bytes: bytes) -> str:
    if file.content_type == "application/pdf":
        try:
            bio = BytesIO(file_bytes)
            text = extract_text(bio)
            if not text.strip():
                raise Exception("No extractable text found in PDF")
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"PDF parsing failed: {str(e)}"
            )
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            bio = BytesIO(file_bytes)
            doc = Document(bio)
            text = "\n".join(p.text for p in doc.paragraphs)
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"DOCX parsing failed: {str(e)}"
            )
    else:
        raise HTTPException(400, "Unsupported file encoding")

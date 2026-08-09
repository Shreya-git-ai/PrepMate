from pypdf import PdfReader
import os

def chunk_pdf(file_path):
    """Extract text page-by-page from a PDF."""
    reader = PdfReader(file_path)
    filename = os.path.basename(file_path)
    chunks = []

    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text and text.strip():
            chunks.append({
                "text": text.strip(),
                "source": filename,
                "page": page_num
            })
    return chunks


def chunk_folder(folder_path):
    """Run chunk_pdf on every .pdf in the folder."""
    all_chunks = []
    for fname in os.listdir(folder_path):
        if fname.endswith(".pdf"):
            full_path = os.path.join(folder_path, fname)
            all_chunks.extend(chunk_pdf(full_path))
    return all_chunks
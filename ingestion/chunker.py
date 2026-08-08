from pypdf import PdfReader
import os
#files and folders ke sath kaam karna hai so imported os


#extract text page-by-page from pdfs we have given as data

def chunk_pdf(file_path):
    reader=PdfReader(file_path)
    file_name=os.path.basename(file_path)
    chunks=[]
    #go through evry pages using for loop
    for page_num,page in enumerate(reader.pages,start=1):
        text=page.extract_text()
        if text and text.strip():
            chunks.append(
                "text":text.split(),
                "source": file_name,
                "page_num": page_num
            )
    return chunks


def chunk_folder(folder_path):
    """Run chunk_pdf on every .pdf in the folder."""
    all_chunks = []
    for fname in os.listdir(folder_path):
        if fname.endswith(".pdf"):
            full_path = os.path.join(folder_path, fname)
            all_chunks.extend(chunk_pdf(full_path))
    return all_chunks
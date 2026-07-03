import os
import fitz  # PyMuPDF
# import easyocr (Heavy dependency, initialize only when needed or use in background tasks)

class OCRAgent:
    def __init__(self):
        # self.reader = easyocr.Reader(['en'])
        pass
        
    def extract_text(self, file_path: str) -> str:
        """
        Extracts text from PDF or images.
        For Phase 3, we implement basic PDF text extraction using PyMuPDF.
        """
        ext = os.path.splitext(file_path)[1].lower()
        extracted_text = ""
        
        try:
            if ext == '.pdf':
                doc = fitz.open(file_path)
                for page in doc:
                    extracted_text += page.get_text()
                doc.close()
            elif ext in ['.png', '.jpg', '.jpeg']:
                # TODO: Integrate EasyOCR here for images in future enhancements
                extracted_text = "[Image OCR not fully implemented in mock phase]"
            elif ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    extracted_text = f.read()
            else:
                extracted_text = "[Unsupported file type for OCR]"
                
        except Exception as e:
            print(f"OCR Error: {e}")
            
        return extracted_text

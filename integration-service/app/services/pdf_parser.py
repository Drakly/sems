import logging
import re
from typing import Dict, Any, List
import pytesseract
from pdf2image import convert_from_path

logger = logging.getLogger(__name__)

class PdfParser:
    """
    Service to parse PDF invoices and extract structured data
    """
    
    def __init__(self):
        self.patterns = {
            'invoice_number': r'(?i)invoice\s*(?:#|number|num)?\s*[:]?\s*([A-Z0-9-]+)',
            'date': r'(?i)(?:invoice|date)(?:\s*date)?(?:\s*[:#])?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4})',
            'total_amount': r'(?i)(?:total|amount|sum)(?:\s*due)?(?:\s*:)?\s*[$€£]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))',
            'company_name': r'(?i)(?:from|vendor|supplier|company)(?:\s*name)?(?:\s*:)?\s*([A-Za-z0-9\s.,&]+?)(?:\n|Inc\.|Ltd\.|LLC|Co\.|Corp\.|Corporation)',
            'vendor_tax_id': r'(?i)(?:tax\s*id|vat|ein|tin)(?:\s*:)?\s*((?:[A-Z]{2})?\d{2}[-\s]?\d{7,})',
        }
    
    def parse(self, pdf_path: str) -> Dict[str, Any]:
        """
        Parse a PDF invoice and extract relevant information
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary with extracted invoice data
        """
        try:
            logger.info(f"Parsing PDF: {pdf_path}")
            
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            # Extract text from all pages
            text = ""
            for img in images:
                text += pytesseract.image_to_string(img)
            
            # Extract data using regex patterns
            result = {}
            for key, pattern in self.patterns.items():
                matches = re.search(pattern, text)
                if matches:
                    result[key] = matches.group(1).strip()
                else:
                    result[key] = None
            
            # Extract line items (simplified approach)
            result['line_items'] = self._extract_line_items(text)
            
            logger.info(f"Successfully parsed invoice with data: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            raise
    
    def _extract_line_items(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract line items from invoice text (simplified implementation)
        """
        # This is a simplified implementation - a real solution would be more complex
        # and might involve machine learning or more sophisticated pattern matching
        
        lines = []
        # Look for patterns like item descriptions followed by quantities and amounts
        item_pattern = r'(?m)^([A-Za-z0-9\s\-\&\.]{10,60})\s+(\d+)\s+(\d+[.,]\d{2})\s+(\d+[.,]\d{2})$'
        
        for match in re.finditer(item_pattern, text):
            lines.append({
                'description': match.group(1).strip(),
                'quantity': match.group(2),
                'unit_price': match.group(3),
                'total': match.group(4)
            })
        
        return lines 
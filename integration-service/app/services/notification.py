import logging
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Service to send notifications to other microservices
    """
    
    def __init__(self, notification_service_url: str):
        self.notification_service_url = notification_service_url
    
    def notify_invoice_processed(self, invoice_id: str, invoice_data: Dict[str, Any]) -> bool:
        """
        Notify the expense service about a processed invoice
        
        Args:
            invoice_id: ID of the processed invoice
            invoice_data: Extracted data from the invoice
            
        Returns:
            True if notification was successful, False otherwise
        """
        try:
            url = f"{self.notification_service_url}/api/v1/notifications/invoice-processed"
            
            payload = {
                "invoiceId": invoice_id,
                "invoiceNumber": invoice_data.get("invoice_number"),
                "vendorName": invoice_data.get("company_name"),
                "invoiceDate": invoice_data.get("date"),
                "totalAmount": invoice_data.get("total_amount"),
                "lineItems": invoice_data.get("line_items", []),
                "eventType": "INVOICE_PROCESSED"
            }
            
            response = requests.post(url, json=payload, timeout=5)
            
            if response.status_code == 202:
                logger.info(f"Successfully notified about invoice {invoice_id}")
                return True
            else:
                logger.warning(f"Failed to notify about invoice {invoice_id}, status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending notification for invoice {invoice_id}: {str(e)}")
            return False 
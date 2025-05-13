from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from bson.objectid import ObjectId
from typing import List, Dict, Any, Optional

from app.config import settings
from app.services.pdf_parser import PdfParser
from app.services.database import get_db, Database
from app.services.notification import NotificationService
from app.models.invoice import Invoice, InvoiceCreate, InvoiceResponse, InvoiceStatus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SEMS Integration Service",
    description="API for processing invoices and integrating with external systems",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create services
pdf_parser = PdfParser()
notification_service = NotificationService(settings.NOTIFICATION_SERVICE_URL)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "integration-service"}


@app.post("/api/v1/invoices/upload", response_model=InvoiceResponse)
async def upload_invoice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Database = Depends(get_db),
):
    """
    Upload a PDF invoice for processing
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Save file temporarily
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    try:
        # Create invoice record
        invoice_id = ObjectId()
        invoice = InvoiceCreate(
            file_name=file.filename,
            status=InvoiceStatus.PROCESSING,
            file_path=file_path,
        )
        
        # Insert into database
        db.invoices.insert_one({
            "_id": invoice_id,
            "file_name": invoice.file_name,
            "status": invoice.status,
            "file_path": invoice.file_path,
            "parsed_data": None,
            "created_at": Invoice.get_current_time(),
            "updated_at": Invoice.get_current_time()
        })
        
        # Process invoice in background
        background_tasks.add_task(
            process_invoice, 
            str(invoice_id), 
            file_path
        )
        
        return {
            "id": str(invoice_id),
            "file_name": invoice.file_name,
            "status": invoice.status,
            "message": "Invoice upload successful, processing started"
        }
    
    except Exception as e:
        logger.error(f"Error uploading invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading invoice: {str(e)}")


async def process_invoice(invoice_id: str, file_path: str):
    """
    Background task to process the invoice
    """
    db = next(get_db())
    try:
        # Parse the PDF
        parsed_data = pdf_parser.parse(file_path)
        
        # Update the database with parsed information
        db.invoices.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {
                "parsed_data": parsed_data,
                "status": InvoiceStatus.COMPLETED,
                "updated_at": Invoice.get_current_time()
            }}
        )
        
        # Notify the expense service
        notification_service.notify_invoice_processed(invoice_id, parsed_data)
        
    except Exception as e:
        logger.error(f"Error processing invoice {invoice_id}: {str(e)}")
        db.invoices.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {
                "status": InvoiceStatus.FAILED,
                "error": str(e),
                "updated_at": Invoice.get_current_time()
            }}
        )
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)


@app.get("/api/v1/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, db: Database = Depends(get_db)):
    """
    Get invoice details by ID
    """
    try:
        invoice = db.invoices.find_one({"_id": ObjectId(invoice_id)})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        invoice["id"] = str(invoice.pop("_id"))
        return invoice
    
    except Exception as e:
        logger.error(f"Error fetching invoice {invoice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching invoice: {str(e)}")


@app.get("/api/v1/invoices", response_model=List[Invoice])
async def list_invoices(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[InvoiceStatus] = None,
    db: Database = Depends(get_db)
):
    """
    List all invoices with optional filtering
    """
    try:
        # Build query filter
        filter_query = {}
        if status:
            filter_query["status"] = status
            
        invoices = list(db.invoices.find(filter_query).skip(skip).limit(limit))
        
        # Convert _id to string id
        for invoice in invoices:
            invoice["id"] = str(invoice.pop("_id"))
            
        return invoices
        
    except Exception as e:
        logger.error(f"Error listing invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing invoices: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 
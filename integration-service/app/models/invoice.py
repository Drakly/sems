from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime


class InvoiceStatus(str, Enum):
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InvoiceBase(BaseModel):
    file_name: str
    status: InvoiceStatus
    file_path: str

    @staticmethod
    def get_current_time() -> datetime:
        return datetime.utcnow()


class InvoiceCreate(InvoiceBase):
    pass


class Invoice(InvoiceBase):
    id: str = Field(..., alias="_id")
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    error: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class InvoiceResponse(BaseModel):
    id: str
    file_name: str
    status: InvoiceStatus
    message: str 
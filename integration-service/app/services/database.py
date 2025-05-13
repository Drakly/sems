import logging
from pymongo import MongoClient
from pymongo.database import Database as MongoDatabase
from pymongo.collection import Collection
from typing import Generator

from app.config import settings

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, client: MongoClient, db_name: str):
        self.client = client
        self.db: MongoDatabase = client[db_name]
        self.invoices: Collection = self.db.invoices


def get_db() -> Generator[Database, None, None]:
    """
    Database dependency
    """
    try:
        client = MongoClient(settings.MONGODB_URL)
        db = Database(client, settings.MONGODB_DB_NAME)
        yield db
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise
    finally:
        client.close() 
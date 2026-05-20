from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.insights_service import get_meta_filters

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/filters")
def filters_endpoint(db: Session = Depends(get_db)):
    return get_meta_filters(db)

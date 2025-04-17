from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from typing import List

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost/patientdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



# Database model
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    contact = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str

class PatientResponse(PatientCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# FastAPI app
app = FastAPI(
    title="Patient Registration API",
    description="API for managing patient registrations",
    version="1.0.0",
)

from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/patients/", response_model=PatientResponse)
def create_patient(patient: PatientCreate):
    db = SessionLocal()
    try:
        db_patient = Patient(**patient.dict())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/patients/{patient_id}", response_model=PatientResponse)
def read_patient(patient_id: int):
    db = SessionLocal()
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    db.close()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/patients/", response_model=List[PatientResponse])
def read_patients(skip: int = 0, limit: int = 100):
    db = SessionLocal()
    patients = db.query(Patient).offset(skip).limit(limit).all()
    db.close()
    return patients

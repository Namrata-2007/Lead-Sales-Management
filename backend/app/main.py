"""
FastAPI REST API for AI Automated Elevator CRM SaaS
"""
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
from datetime import datetime

app = FastAPI(
    title="ElevateAI CRM SaaS Backend",
    version="1.0.0",
    description="FastAPI Backend for Elevator CRM SaaS with AI qualification, n8n webhooks, and quotation management."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class LeadCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    email: EmailStr
    phone: str
    location: str
    building_type: str = "commercial"
    floors: int = 4
    elevator_requirement: str
    quantity: int = 1
    budget: Optional[float] = None

class LeadResponse(BaseModel):
    id: str
    name: str
    company_name: Optional[str]
    email: str
    phone: str
    location: str
    building_type: str
    floors: int
    elevator_requirement: str
    quantity: int
    budget: Optional[float]
    ai_score: Optional[int]
    status: str
    created_at: datetime

@app.get("/")
def read_root():
    return {
        "service": "ElevateAI CRM SaaS",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead: LeadCreate):
    # Calculate initial score based on elevator parameters
    score = 50
    if lead.floors >= 15:
        score += 25
    elif lead.floors >= 6:
        score += 15
    if lead.quantity >= 2:
        score += 15
    if lead.building_type in ["hospital", "commercial"]:
        score += 10

    score = min(98, max(30, score))

    return LeadResponse(
        id=f"lead_py_{int(datetime.utcnow().timestamp())}",
        name=lead.name,
        company_name=lead.company_name,
        email=lead.email,
        phone=lead.phone,
        location=lead.location,
        building_type=lead.building_type,
        floors=lead.floors,
        elevator_requirement=lead.elevator_requirement,
        quantity=lead.quantity,
        budget=lead.budget,
        ai_score=score,
        status="new",
        created_at=datetime.utcnow()
    )

@app.post("/api/webhooks/n8n")
def receive_n8n_webhook(payload: dict):
    return {"status": "received", "event": payload.get("event", "unknown")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

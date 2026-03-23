from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    department,
    employee,
    house,
    college,
    training,
    fulltime,
    contract,
    intern,
    dependent,
    employee_phone,
    employee_training,
    internship
)

# ── APP SETUP ──
app = FastAPI(
    title="ERMS API",
    description="Employee Resource Management System — Power Plant",
    version="1.0.0"
)

# ── CORS ──
# Allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTES ──
app.include_router(department.router)
app.include_router(employee.router)
app.include_router(house.router)
app.include_router(college.router)
app.include_router(training.router)
app.include_router(fulltime.router)
app.include_router(contract.router)
app.include_router(intern.router)
app.include_router(dependent.router)
app.include_router(employee_phone.router)
app.include_router(employee_training.router)
app.include_router(internship.router)

# ── ROOT ──
@app.get("/")
def root():
    return {
        "message": "Welcome to ERMS API",
        "version": "1.0.0",
        "docs": "/docs"
    }
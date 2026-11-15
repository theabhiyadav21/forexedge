import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import calculator, auth, trades, monte_carlo, analytics, ml, csv_import

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ForexEdge API",
    description="Forex trading risk management platform",
    version="1.0.0"
)

# Render se Vercel ka URL uthao, agar nahi mila toh localhost use karo
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        frontend_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculator.router)
app.include_router(auth.router)      
app.include_router(trades.router)    
app.include_router(monte_carlo.router)
app.include_router(analytics.router) 
app.include_router(ml.router) 
app.include_router(csv_import.router)

@app.get("/")
def root():
    return {"message": "ForexEdge API running 🚀", "docs": "/docs"}

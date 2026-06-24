import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import meetings, search

app = FastAPI(
    title="After Meeting AI API",
    description="API for Meeting Analysis, Transcription, and Semantic Search",
    version="1.0.0"
)

# CORS middleware to allow requests from any frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(meetings.router, prefix="/api/v1/meetings", tags=["Meetings"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the After Meeting AI API!"}

if __name__ == "__main__":
    # Run server
    uvicorn.run("api_main:app", host="0.0.0.0", port=8000, reload=True)

from pydantic import BaseModel
from typing import List, Optional, Dict

class TextUploadRequest(BaseModel):
    text: str

class ProcessedMeetingResponse(BaseModel):
    transcript: str
    cleaned_text: str
    speaker_roles: Dict[str, str]

class AnalyzeRequest(BaseModel):
    transcript: str

class AnalyzeResponse(BaseModel):
    title: str
    analysis: str
    attendees: List[str]

# --- Stateless Search Models ---

class SearchDocument(BaseModel):
    id: str
    title: str
    text: str
    date: Optional[str] = ""
    speakers: Optional[List[str]] = []

class SearchRequest(BaseModel):
    query: str
    documents: List[SearchDocument]
    top_k: int = 5
    speaker: Optional[str] = None
    date: Optional[str] = None
    title: Optional[str] = None

class SearchResultItem(BaseModel):
    score: float
    document_id: str
    meeting_title: str
    meeting_date: str
    speakers: List[str]
    snippet: str

class SearchResponse(BaseModel):
    results: List[SearchResultItem]

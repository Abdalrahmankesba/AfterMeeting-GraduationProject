from fastapi import APIRouter, HTTPException
from models.schemas import SearchRequest, SearchResponse
from services.search_service import stateless_search

router = APIRouter()

@router.post("/", response_model=SearchResponse)
def search_meetings(request: SearchRequest):
    try:
        results = stateless_search(
            query=request.query,
            documents=request.documents,
            top_k=request.top_k,
            speaker=request.speaker,
            date=request.date,
            title=request.title
        )
        return SearchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

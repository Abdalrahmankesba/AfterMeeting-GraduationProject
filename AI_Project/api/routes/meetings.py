import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import (
    TextUploadRequest, ProcessedMeetingResponse,
    AnalyzeRequest, AnalyzeResponse
)
from utils.helpers import extract_speakers_from_cleaned_text
from services import pipeline

router = APIRouter()

@router.post("/upload-audio", response_model=ProcessedMeetingResponse)
def upload_audio(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily for Whisper
        filename = getattr(file, "filename", "") or "audio.mp3"
        file_extension = filename.split(".")[-1] if "." in filename else "mp3"
        file_path = f"temp_api_upload.{file_extension}"
        
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        transcript, cleaned_text, speaker_roles = pipeline.process_audio_step1(file_path)
        
        # Cleanup temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        if speaker_roles is None:
            speaker_roles = {}
            
        return ProcessedMeetingResponse(
            transcript=transcript,
            cleaned_text=cleaned_text,
            speaker_roles=speaker_roles
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-text", response_model=ProcessedMeetingResponse)
def upload_text(request: TextUploadRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
            
        cleaned_text = pipeline.process_text(request.text)
        speaker_roles = extract_speakers_from_cleaned_text(cleaned_text)
        
        return ProcessedMeetingResponse(
            transcript=request.text,
            cleaned_text=cleaned_text,
            speaker_roles=speaker_roles
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_meeting(request: AnalyzeRequest):
    try:
        if not request.transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript cannot be empty")
            
        final_output, title = pipeline.process_analysis_step2(request.transcript)
        attendees = pipeline.extract_attendees(final_output)
        
        return AnalyzeResponse(
            title=title,
            analysis=final_output,
            attendees=attendees
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

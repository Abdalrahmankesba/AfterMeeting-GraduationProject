import os
import time
import shutil
import tempfile
from pydub import AudioSegment
from openai import OpenAI
import config

# Initialize OpenAI client
client = OpenAI(api_key=config.OPENAI_API_KEY)

def transcribe_audio_api(audio_path: str) -> str:
    """
    Transcribes audio by splitting it into 5-minute chunks, processing each
    with OpenAI Whisper, and combining the results.
    
    Supports large files by avoiding the 25MB OpenAI limit.
    """
    if not os.path.exists(audio_path):
        return f"Error: Audio file not found at {audio_path}"

    # Create a temporary directory for chunks
    temp_dir = tempfile.mkdtemp()
    
    try:
        print(f"[Transcription] Loading audio file: {audio_path}")
        audio = AudioSegment.from_file(audio_path)
        
        # Define chunk length (5 minutes in milliseconds)
        chunk_length_ms = 5 * 60 * 1000
        total_duration_ms = len(audio)
        
        full_transcript = []
        
        # Split into chunks
        print(f"[Transcription] Splitting into chunks (Total duration: {total_duration_ms/1000/60:.2f} minutes)")
        
        for i, start_time in enumerate(range(0, total_duration_ms, chunk_length_ms)):
            end_time = min(start_time + chunk_length_ms, total_duration_ms)
            chunk = audio[start_time:end_time]
            
            chunk_name = os.path.join(temp_dir, f"chunk_{i}.mp3")
            chunk.export(chunk_name, format="mp3")
            
            print(f"[Transcription] Processing chunk {i+1} ({start_time/1000}s to {end_time/1000}s)...")
            
            # Transcription with Retry logic
            chunk_text = ""
            max_retries = 3
            
            for attempt in range(max_retries):
                try:
                    with open(chunk_name, "rb") as audio_file:
                        response = client.audio.transcriptions.create(
                            file=audio_file,
                            model="whisper-1",
                            language=config.LANGUAGE,
                            response_format="text",
                            prompt="الاجتماع باللغة العربية، يرجى كتابة النص بدقة مع مراعاة علامات الترقيم وتصحيح الكلمات العامية قدر الإمكان."
                        )
                        chunk_text = response.strip()
                        break  # Success
                except Exception as e:
                    print(f"[Transcription] Attempt {attempt+1} failed for chunk {i}: {e}")
                    if attempt < max_retries - 1:
                        time.sleep(3)  # Wait before retry
                    else:
                        chunk_text = f"[Error transcribing chunk {i}]"
            
            if chunk_text:
                full_transcript.append(chunk_text)
            
            # Small delay between requests to avoid rate limits
            time.sleep(1)
            
        print("[Transcription] Completed all chunks.")
        return " ".join(full_transcript)

    except Exception as e:
        print(f"[Error in Transcription Service] {e}")
        return f"Error during transcription: {e}"
    
    finally:
        # Cleanup: Remove temporary chunks
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            print(f"[Transcription] Cleaned up temporary files in {temp_dir}")

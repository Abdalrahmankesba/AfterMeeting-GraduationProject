from services.transcription import transcribe_audio_api
from services.analyzer import analyze_meeting

def extract_title_from_analysis(analysis_text: str) -> str:
    lines = analysis_text.split("\n")
    for i, line in enumerate(lines):
        if "عنوان الاجتماع" in line:
            if i + 1 < len(lines):
                return lines[i + 1].strip()
    return "Meeting"

def clean_analysis_output(analysis_text: str) -> str:
    if "النص بعد التصحيح" in analysis_text:
        analysis_text = analysis_text.split("النص بعد التصحيح")[0]
    return analysis_text.strip()

def extract_attendees(final_output: str) -> list:
    attendees = []
    lines = final_output.split("\n")
    capture = False

    for line in lines:
        line = line.strip()
        if line.startswith("الحضور"):
            capture = True
            continue
        if capture:
            if line.startswith("-"):
                name = line.replace("-", "").strip()
                attendees.append(name)
            else:
                break
    return attendees

def process_audio_step1(audio_path: str):
    transcript = transcribe_audio_api(audio_path)
    speaker_roles = {}
    return transcript, transcript, speaker_roles

def process_analysis_step2(transcript: str):
    analysis = analyze_meeting(transcript)
    analysis = clean_analysis_output(analysis)
    title = extract_title_from_analysis(analysis)
    return analysis, title

def process_text(text: str) -> str:
    return text

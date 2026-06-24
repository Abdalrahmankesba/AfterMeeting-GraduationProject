import os
import json
from datetime import datetime

def create_meeting_folder(title):
    date_str = datetime.now().strftime("%Y-%m-%d_%H-%M")
    folder_name = f"{date_str}_{title.replace(' ', '_')}"
    path = os.path.join("meetings", folder_name)
    os.makedirs(path, exist_ok=True)
    return path, date_str

def save_meeting(path, audio_path, transcript, final_output, title, date, speakers, type):
    # حفظ النص النهائي
    with open(os.path.join(path, "final_output.txt"), "w", encoding="utf-8") as f:
        f.write(final_output)
    
    # حفظ البيانات الوصفية (Metadata)
    metadata = {
        "title": title,
        "date": date,
        "speakers": speakers,
        "type": type
    }
    with open(os.path.join(path, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
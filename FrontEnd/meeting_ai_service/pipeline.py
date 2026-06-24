import whisper
import os
from openai import OpenAI


client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

def process_audio_step1(audio_path):
    """المرحلة الأولى: تحويل الصوت إلى نص وتصحيحه لغوياً"""
    try:

        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        raw_transcript = result['text']


        cleaned_text = process_text(raw_transcript)

        speaker_roles = {"Speaker_0": "حاضر", "Speaker_1": "حاضر"}
        
        return raw_transcript, cleaned_text, speaker_roles
    except Exception as e:
        print(f"Error in pipeline step 1: {e}")
        return "", "", {}

def process_text(text):
    """تصحيح الأخطاء الإملائية وتنسيق الحوار"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "أنت مساعد خبير في تفريغ الاجتماعات. قم بتصحيح النص التالي لغوياً ونظمه في شكل حوار واضح."},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content

def process_analysis_step2(text):
    """المرحلة الثانية: استخراج الملخص، المهام، والعنوان"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "حلل نص الاجتماع التالي واستخرج: 1- عنوان مختصر، 2- ملخص شامل، 3- قائمة بالمهام المطلوبة (Action Items)."},
            {"role": "user", "content": text}
        ]
    )
    full_analysis = response.choices[0].message.content

    title = full_analysis.split('\n')[0].replace("العنوان:", "").strip()
    return full_analysis, title
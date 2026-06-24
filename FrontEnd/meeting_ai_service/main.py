import streamlit as st
import time, os, re, json
from datetime import datetime
from recorder import start_recording, stop_recording, pause_recording, resume_recording
from pipeline import process_audio_step1, process_analysis_step2, process_text
from storage import create_meeting_folder, save_meeting
# من المفترض وجود محرك البحث الخاص بك هنا
# from semantic_search.search_engine import search, add_document_to_index 

st.set_page_config(page_title="After Meeting AI", layout="wide")

# CSS لتحسين المظهر
st.markdown("""
    <style>
    .stButton>button { width: 100%; border-radius: 10px; height: 3em; font-weight: bold; }
    .stTextArea>div>div>textarea { border-radius: 15px; }
    </style>
    """, unsafe_allow_html=True)

st.title("🎙 After Meeting Intelligence System")

# ... (دالة extract_speakers_from_text كما هي عندك) ...

# =========================
# SESSION STATE INIT
# =========================
if "recording" not in st.session_state:
    st.session_state.update({
        "recording": False, "paused": False, "start_time": None, "elapsed": 0,
        "transcript": "", "cleaned_text": "", "final_output": "", "auto_title": "",
        "audio_path": "", "speaker_roles": {}, "analysis_generated": False, "search_results": []
    })

# ====================================================
# Layout
# ====================================================
left, right = st.columns([1, 2], gap="large")

with left:
    st.subheader("🕹 التحكم في التسجيل")
    c1, c2 = st.columns(2)
    
    if not st.session_state.recording:
        if c1.button("▶ Start Recording", type="primary"):
            start_recording()
            st.session_state.recording = True
            st.session_state.start_time = time.time()
            st.rerun()
    else:
        if c1.button("⏹ Stop & Process", type="secondary"):
            with st.spinner("جاري معالجة الصوت..."):
                audio_path = stop_recording()
                t, ct, sr = process_audio_step1(audio_path)
                st.session_state.update({
                    "recording": False, "audio_path": audio_path,
                    "transcript": t, "cleaned_text": ct, "speaker_roles": sr
                })
            st.success("تم التفريغ بنجاح!")
            st.rerun()

    # التايمر (Timer)
    if st.session_state.recording:
        elapsed = int(time.time() - st.session_state.start_time)
        st.metric("مدة التسجيل", f"{elapsed//60:02d}:{elapsed%60:02d}")
        time.sleep(1)
        st.rerun()

with right:
    tab1, tab2 = st.tabs(["📝 معالجة النصوص", "📂 رفع ملفات"])
    
    with tab1:
        text_input = st.text_area("أدخل نص الاجتماع هنا يدويًا...", height=200)
        if st.button("تحسين النص الذكي"):
            if text_input:
                with st.spinner("جاري التحسين..."):
                    st.session_state.cleaned_text = process_text(text_input)
                    st.rerun()

    with tab2:
        uploaded_file = st.file_uploader("اختر ملف صوتي (WAV/MP3)", type=["wav", "mp3"])
        if uploaded_file:
            with open("temp_upload.wav", "wb") as f:
                f.write(uploaded_file.getbuffer())
            if st.button("ابدأ معالجة الملف المرفوع"):
                with st.spinner("جاري التحليل..."):
                    t, ct, sr = process_audio_step1("temp_upload.wav")
                    st.session_state.update({"transcript": t, "cleaned_text": ct, "speaker_roles": sr})
                st.success("تمت المعالجة!")

# ====================================================
# النتائج النهائية وحفظ الاجتماع
# ====================================================
if st.session_state.cleaned_text:
    st.divider()
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.subheader("📄 النص المعدل")
        st.session_state.cleaned_text = st.text_area("راجع النص:", value=st.session_state.cleaned_text, height=300)
        if st.button("📊 توليد الملخص والمهام"):
            with st.spinner("AI يفكر..."):
                fo, title = process_analysis_step2(st.session_state.cleaned_text)
                st.session_state.final_output = fo
                st.session_state.auto_title = title
    
    with col_b:
        if st.session_state.final_output:
            st.subheader("💡 تحليل الاجتماع")
            meeting_title = st.text_input("عنوان الاجتماع", value=st.session_state.auto_title)
            final_edit = st.text_area("الملخص والمهام:", value=st.session_state.final_output, height=300)
            
            if st.button("💾 حفظ الاجتماع في الأرشيف"):
                path, date = create_meeting_folder(meeting_title)
                save_meeting(path, st.session_state.audio_path, st.session_state.transcript, 
                             final_edit, meeting_title, date, st.session_state.speaker_roles, "record")
                st.success(f"تم الحفظ في: {path}")

# البحث السيمانتيكي يوضع في الأسفل كما في كودك...
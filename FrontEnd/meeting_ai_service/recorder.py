import sounddevice as sd
import soundfile as sf
import threading

recording_data = []
is_recording = False

def start_recording():
    global is_recording, recording_data
    recording_data = []
    is_recording = True
    threading.Thread(target=_record_thread).start()

def _record_thread():
    with sd.InputStream(samplerate=44100, channels=1, callback=_callback):
        while is_recording:
            sd.sleep(100)

def _callback(indata, frames, time, status):
    recording_data.append(indata.copy())

def stop_recording():
    global is_recording
    is_recording = False
    import numpy as np
    audio_array = np.concatenate(recording_data)
    path = "temp_recording.wav"
    sf.write(path, audio_array, 44100)
    return path


def pause_recording(): pass
def resume_recording(): pass
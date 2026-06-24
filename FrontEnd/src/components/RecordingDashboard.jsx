import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, RotateCcw, Mic, AlertTriangle, Loader2 } from 'lucide-react';

export default function RecordingDashboard({ onRecordingComplete }) {
  // الحالات (States) بناءً على منطق app.py
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // بالثواني
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  // منطق العداد (Timer Logic)
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // دالة تحويل الثواني لتنسيق MM:SS كما في الكود الأصلي
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. START RECORDING
  const handleStart = async () => {
    try {
      // هنا يتم استدعاء API الباك إند الخاص بـ start_recording()
      setIsRecording(true);
      setIsPaused(false);
      setElapsedTime(0);
      setError(null);
    } catch (err) {
      setError("Microphone access denied or backend error.");
    }
  };

  // 2. STOP RECORDING (المرحلة الأهم في app.py)
const handleStop = async () => {
    setIsProcessing(true);
    setIsRecording(false);
    setIsPaused(false);

    try {
      // محاكاة تأخير المعالجة (Simulation) لمدة ثانيتين
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        auto_title: "Quick Sync Meeting",
        duration: formatTime(elapsedTime),
        unique_speakers: 2
      };

      onRecordingComplete(mockData); 
    } catch (err) {
      setError("Error processing audio. Please try again.");
    } finally {
      setIsProcessing(false);
      setElapsedTime(0);
    }
};

  // 3. PAUSE RECORDING
  const handlePause = () => {
    if (isRecording && !isPaused) {
      // استدعاء pause_recording() في الباك إند
      setIsPaused(true);
    }
  };

  // 4. RESUME RECORDING
  const handleResume = () => {
    if (isRecording && isPaused) {
      // استدعاء resume_recording() في الباك إند
      setIsPaused(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
        <h3 className="font-bold text-slate-800 text-lg">🎙 Recording Control</h3>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-5xl font-mono font-black text-slate-700 tracking-tighter">
          {formatTime(elapsedTime)}
        </div>
        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
          {isPaused ? "Paused" : isRecording ? "Live Recording" : "Ready to Start"}
        </p>
      </div>

      {/* Control Buttons Group */}
      <div className="grid grid-cols-2 gap-3">
        {!isRecording ? (
          <button 
            onClick={handleStart}
            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Play size={20} fill="white" /> Start Recording
          </button>
        ) : (
          <>
            {isPaused ? (
              <button 
                onClick={handleResume}
                className="flex items-center justify-center gap-2 py-4 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-all active:scale-95"
              >
                <RotateCcw size={20} /> Resume
              </button>
            ) : (
              <button 
                onClick={handlePause}
                className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                <Pause size={20} fill="currentColor" /> Pause
              </button>
            )}
            
            <button 
              onClick={handleStop}
              className="flex items-center justify-center gap-2 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-95"
            >
              <Square size={20} fill="white" /> Stop
            </button>
          </>
        )}
      </div>

      {/* Loading & Errors Status */}
      {isProcessing && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sky-600 font-bold text-sm bg-sky-50 p-4 rounded-2xl border border-sky-100">
          <Loader2 className="animate-spin" size={18} />
          Processing Transcription...
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-3 text-red-600 text-xs bg-red-50 p-4 rounded-2xl border border-red-100">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
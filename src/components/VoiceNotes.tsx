import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VoiceNotesProps {
  journalEntryId?: string;
  onSave?: (audioUrl: string) => void;
}

export default function VoiceNotes({ journalEntryId, onSave }: VoiceNotesProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioURL) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveVoiceNote = async () => {
    if (!audioURL || !user) return;

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      const fileName = `voice-note-${Date.now()}.wav`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('voice-notes')
        .getPublicUrl(filePath);

      await supabase.from('voice_notes').insert({
        user_id: user.id,
        journal_entry_id: journalEntryId || null,
        audio_url: publicUrl,
        duration_seconds: duration,
      });

      if (onSave) onSave(publicUrl);

      setAudioURL(null);
      setDuration(0);
      alert('Voice note saved successfully!');
    } catch (error) {
      console.error('Error saving voice note:', error);
      alert('Failed to save voice note');
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5" />
        Voice Notes
      </h3>

      {!audioURL ? (
        <div className="flex flex-col items-center justify-center py-8">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all animate-pulse shadow-lg"
            >
              <Square className="w-10 h-10 text-white" />
            </button>
          )}

          <div className="mt-4 text-2xl font-mono text-white">
            {formatTime(duration)}
          </div>

          <p className="mt-2 text-slate-400 text-sm">
            {isRecording ? 'Recording in progress...' : 'Click to start recording'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300">Recording Duration</span>
              <span className="text-white font-mono">{formatTime(duration)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={togglePlayback}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={deleteRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={saveVoiceNote}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Save Voice Note
          </button>

          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

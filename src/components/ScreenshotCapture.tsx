import { useState, useRef } from 'react';
import { Camera, Download, X, Pencil, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ScreenshotCaptureProps {
  onCapture: (url: string) => void;
  journalEntryId?: string;
}

export default function ScreenshotCapture({ onCapture, journalEntryId }: ScreenshotCaptureProps) {
  const { user } = useAuth();
  const [showCapture, setShowCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [caption, setCaption] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      setShowCapture(true);
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' as any }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      setShowCapture(true);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please upload an image instead.');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const saveScreenshot = async () => {
    if (!capturedImage || !user) return;

    try {
      const blob = await (await fetch(capturedImage)).blob();
      const fileName = `screenshot-${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      if (journalEntryId) {
        await supabase.from('trade_screenshots').insert({
          user_id: user.id,
          journal_entry_id: journalEntryId,
          screenshot_url: publicUrl,
          caption: caption || null,
        });
      }

      onCapture(publicUrl);
      setShowCapture(false);
      setCapturedImage(null);
      setCaption('');
    } catch (error) {
      console.error('Error saving screenshot:', error);
      alert('Failed to save screenshot');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleScreenshot}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Camera className="w-4 h-4" />
          Capture Screen
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {showCapture && capturedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Annotate Screenshot</h3>
              <button
                onClick={() => {
                  setShowCapture(false);
                  setCapturedImage(null);
                  setCaption('');
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 relative">
              <img
                src={capturedImage}
                alt="Screenshot"
                className="w-full rounded-lg"
                onLoad={(e) => {
                  if (canvasRef.current) {
                    const img = e.target as HTMLImageElement;
                    canvasRef.current.width = img.width;
                    canvasRef.current.height = img.height;
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Pencil className="w-4 h-4 inline mr-2" />
                Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to describe this screenshot..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveScreenshot}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Screenshot
              </button>
              <button
                onClick={() => {
                  setShowCapture(false);
                  setCapturedImage(null);
                  setCaption('');
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Click and drag on the image to draw annotations
            </p>
          </div>
        </div>
      )}
    </>
  );
}

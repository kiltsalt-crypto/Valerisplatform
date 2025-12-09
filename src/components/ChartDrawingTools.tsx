import { useState } from 'react';
import { Pencil, TrendingUp, Square, Circle, Trash2 } from 'lucide-react';

interface DrawingLine {
  id: string;
  type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  color: string;
}

export default function ChartDrawingTools() {
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [activeTool, setActiveTool] = useState<'trendline' | 'horizontal' | 'vertical' | 'rectangle' | null>(null);
  const [color, setColor] = useState('#3b82f6');

  const addDrawing = (type: DrawingLine['type']) => {
    const newDrawing: DrawingLine = {
      id: Date.now().toString(),
      type,
      startX: 100,
      startY: 100,
      endX: 300,
      endY: type === 'trendline' || type === 'rectangle' ? 200 : 100,
      color,
    };
    setDrawings(prev => [...prev, newDrawing]);
    setActiveTool(null);
  };

  const clearDrawings = () => {
    setDrawings([]);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Pencil className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Chart Drawing Tools</h2>
            <p className="text-slate-400 text-sm">Annotate charts with lines and shapes</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => addDrawing('trendline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTool === 'trendline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trendline
            </button>
            <button
              onClick={() => addDrawing('horizontal')}
              className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition"
            >
              Horizontal Line
            </button>
            <button
              onClick={() => addDrawing('rectangle')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTool === 'rectangle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Square className="w-4 h-4" />
              Rectangle
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-sm">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={clearDrawings}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg p-4" style={{ height: '400px', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {drawings.map((drawing) => {
              if (drawing.type === 'trendline') {
                return (
                  <line
                    key={drawing.id}
                    x1={drawing.startX}
                    y1={drawing.startY}
                    x2={drawing.endX}
                    y2={drawing.endY}
                    stroke={drawing.color}
                    strokeWidth="2"
                  />
                );
              } else if (drawing.type === 'horizontal') {
                return (
                  <line
                    key={drawing.id}
                    x1="0"
                    y1={drawing.startY}
                    x2="100%"
                    y2={drawing.startY}
                    stroke={drawing.color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              } else if (drawing.type === 'rectangle') {
                return (
                  <rect
                    key={drawing.id}
                    x={Math.min(drawing.startX, drawing.endX || drawing.startX)}
                    y={Math.min(drawing.startY, drawing.endY || drawing.startY)}
                    width={Math.abs((drawing.endX || drawing.startX) - drawing.startX)}
                    height={Math.abs((drawing.endY || drawing.startY) - drawing.startY)}
                    fill="none"
                    stroke={drawing.color}
                    strokeWidth="2"
                  />
                );
              }
              return null;
            })}
          </svg>

          {drawings.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              Click a tool above to add drawings to your chart
            </div>
          )}
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="text-white font-semibold mb-2">Active Drawings ({drawings.length})</div>
          {drawings.length === 0 ? (
            <div className="text-slate-400 text-sm">No drawings yet</div>
          ) : (
            <div className="space-y-2">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="flex items-center justify-between bg-slate-800 rounded p-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: drawing.color }}
                    />
                    <span className="text-white text-sm capitalize">{drawing.type}</span>
                  </div>
                  <button
                    onClick={() => setDrawings(prev => prev.filter(d => d.id !== drawing.id))}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 font-semibold mb-2">Feature Note</div>
          <div className="text-slate-300 text-sm">
            Drawing tools are demonstrated here. In production, these would overlay on the main price chart with click-and-drag functionality for precise placement.
          </div>
        </div>
      </div>
    </div>
  );
}

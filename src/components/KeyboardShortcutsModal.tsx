import { X, Keyboard } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ onClose }: Props) {
  const shortcuts = [
    { key: 'H', description: 'Go to Home/Dashboard' },
    { key: 'T', description: 'Open Paper Trading' },
    { key: 'J', description: 'Open Trading Journal' },
    { key: 'A', description: 'View Analytics' },
    { key: 'C', description: 'Open Economic Calendar' },
    { key: 'N', description: 'View Market News' },
    { key: 'W', description: 'Open Watchlists' },
    { key: 'L', description: 'View Leaderboard' },
    { key: 'F', description: 'Open Futures Trading' },
    { key: 'R', description: 'Risk Calculator' },
    { key: 'G', description: 'P&L Goals' },
    { key: 'Esc', description: 'Close Modal/Cancel' },
    { key: '?', description: 'Show this help' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-7 h-7 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"
            >
              <span className="text-slate-300">{shortcut.description}</span>
              <kbd className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-purple-400 font-mono text-sm font-bold">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-slate-700 rounded text-xs mx-1">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}

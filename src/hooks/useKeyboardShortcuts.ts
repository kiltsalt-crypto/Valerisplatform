import { useEffect } from 'react';

export const useKeyboardShortcuts = (onShortcut: (key: string) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            onShortcut('home');
            break;
          case 'l':
            e.preventDefault();
            onShortcut('learn');
            break;
          case 't':
            e.preventDefault();
            onShortcut('trade');
            break;
          case 'j':
            e.preventDefault();
            onShortcut('journal');
            break;
          case 'a':
            e.preventDefault();
            onShortcut('analytics');
            break;
          case 'k':
            e.preventDefault();
            onShortcut('shortcuts');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut]);
};

export const shortcuts = [
  { key: 'Ctrl/Cmd + H', action: 'Go to Home' },
  { key: 'Ctrl/Cmd + L', action: 'Go to Learning' },
  { key: 'Ctrl/Cmd + T', action: 'Go to Trading' },
  { key: 'Ctrl/Cmd + J', action: 'Go to Journal' },
  { key: 'Ctrl/Cmd + A', action: 'Go to Analytics' },
  { key: 'Ctrl/Cmd + K', action: 'Show Shortcuts' },
];

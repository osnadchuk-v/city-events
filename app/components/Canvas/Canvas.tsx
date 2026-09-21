'use client';

import '@excalidraw/excalidraw/index.css';
import type { AppState, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
});

interface CanvasProps {
  onApiReady?: (api: ExcalidrawImperativeAPI) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export default function Canvas({ onApiReady, onThemeChange }: CanvasProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastTheme = useRef<string>('light');

  const handleMount = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      onApiReady?.(api);
    },
    [onApiReady],
  );

  const handleChange = useCallback(
    (_elements: readonly any[], appState: AppState) => {
      if (appState.theme !== lastTheme.current) {
        lastTheme.current = appState.theme;
        onThemeChange?.(appState.theme as 'light' | 'dark');
      }
    },
    [onThemeChange],
  );

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={handleMount}
        initialData={{ appState: { openSidebar: null } }}
        onChange={handleChange}
      />
    </div>
  );
}

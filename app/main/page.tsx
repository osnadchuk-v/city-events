'use client';

import cn from 'classnames';
import Canvas from '@/app/components/Canvas';
import ChatPanel from '@/app/components/chat/ChatPanel';
import { useCallback, useState } from 'react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import styles from './page.module.css';

const Home = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawAPI(api);
  }, []);

  return (
    <div className={cn(styles.app, theme)}>
      <div className={styles.canvasContainer}>
        <Canvas onApiReady={handleApiReady} onThemeChange={setTheme} />
      </div>
      <ChatPanel />
    </div>
  );
};

export default Home;

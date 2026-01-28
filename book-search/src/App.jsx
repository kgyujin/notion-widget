import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Search as SearchIcon, BookOpen, ArrowLeft } from 'lucide-react';
import BookSearch from './components/BookSearch';
import Settings from './components/Settings';

export default function App() {
  const [view, setView] = useState('search');
  const [config, setConfig] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    // 1. Check URL params for portable config
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');

    if (configParam) {
      try {
        // Decode Base64 -> UTF-8 -> JSON
        const decoded = JSON.parse(decodeURIComponent(atob(configParam)));
        setConfig(decoded);
        localStorage.setItem('notion-book-widget-config', JSON.stringify(decoded)); // Sync to local
        return; // Skip normal load
      } catch (e) {
        console.error("Failed to parse config from URL", e);
      }
    }

    // 2. Load from LocalStorage
    const savedConfig = localStorage.getItem('notion-book-widget-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      setView('settings');
    }

    const savedTheme = localStorage.getItem('notion-book-widget-theme') || 'default';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    root.classList.remove('theme-pink', 'theme-blue', 'theme-purple', 'theme-gray');
    if (themeName !== 'default') {
      root.classList.add(`theme-${themeName}`);
    }
  };

  const handleSaveSettings = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('notion-book-widget-config', JSON.stringify(newConfig));
    setView('search');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('notion-book-widget-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="h-screen bg-white text-gray-800 transition-colors duration-300 overflow-hidden">
      <div className="w-full h-full flex flex-col relative px-4 py-2">
        <header className="flex items-center justify-between mb-0.5 py-1">
          <button
            onClick={() => setView(view === 'search' ? 'settings' : 'search')}
            className="p-1.5 rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all active:scale-95"
            aria-label={view === 'search' ? "Settings" : "Back to Search"}
            title={view === 'search' ? "설정 (Settings)" : "검색으로 돌아가기"}
          >
            {view === 'search' ? <SettingsIcon size={16} /> : <div className="flex items-center gap-1 text-[10px] font-semibold"><ArrowLeft size={14} /> 이전</div>}
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded-md text-primary">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden flex flex-col">
          {view === 'settings' ? (
            <Settings
              initialConfig={config}
              onSave={handleSaveSettings}
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
          ) : (
            <BookSearch config={config} />
          )}
        </main>
      </div>
    </div>
  );
}

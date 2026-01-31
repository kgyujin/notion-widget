import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Search as SearchIcon, BookOpen, ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react';
import BookSearch from './components/BookSearch';
import Settings from './components/Settings';
import AIRecommend from './components/AIRecommend';
import MyPick from './components/MyPick';

export default function App() {
  const [view, setView] = useState('search');
  const [config, setConfig] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');

    if (configParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(configParam)));
        setConfig(decoded);
        localStorage.setItem('notion-book-widget-config', JSON.stringify(decoded));
        return;
      } catch (e) {
        console.error("Failed to parse config from URL", e);
      }
    }

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

  const NavButton = ({ active, icon: Icon, onClick, label }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all w-16
          ${active
          ? 'bg-primary/10 text-primary scale-105 font-bold shadow-sm'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[9px]">{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-white text-gray-800 transition-colors duration-300 overflow-hidden flex flex-col">
      <div className="w-full flex-1 relative flex flex-col overflow-hidden">
        <header className="px-4 py-3 flex items-center justify-between bg-white flex-shrink-0">
          {view === 'settings' ? (
            <button
              onClick={() => setView('search')}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} /> 이전
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <BookOpen className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <h1 className="text-sm font-bold text-gray-800 tracking-tight">Book Widget</h1>
            </div>
          )}

          <button
            onClick={() => setView('settings')}
            className={`p-1.5 rounded-lg transition-all ${view === 'settings' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <SettingsIcon size={16} />
          </button>
        </header>

        <main className="flex-1 relative overflow-hidden flex flex-col pb-2">
          {view === 'settings' ? (
            <div className="px-4 h-full overflow-y-auto custom-scrollbar">
              <Settings
                initialConfig={config}
                onSave={handleSaveSettings}
                currentTheme={theme}
                onThemeChange={handleThemeChange}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden relative">
                {view === 'search' && <BookSearch config={config} />}
                {view === 'ai' && <AIRecommend config={config} />}
                {view === 'mypick' && <MyPick config={config} />}
              </div>

              <div className="px-6 py-2 pb-4 bg-white/90 backdrop-blur border-t border-gray-50 flex justify-between items-center z-20">
                <NavButton active={view === 'search'} icon={SearchIcon} onClick={() => setView('search')} label="검색" />
                <NavButton active={view === 'ai'} icon={Sparkles} onClick={() => setView('ai')} label="AI 추천" />
                <NavButton active={view === 'mypick'} icon={RefreshCw} onClick={() => setView('mypick')} label="내 서재 픽" />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

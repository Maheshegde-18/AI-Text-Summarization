import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Summarizer from './components/Summarizer';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { SAMPLE_TEXTS } from './utils/samples';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeSampleText, setActiveSampleText] = useState('');
  const [toast, setToast] = useState(null);

  // Toggle theme class on body/html
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectSample = (index) => {
    if (SAMPLE_TEXTS[index]) {
      setActiveSampleText(SAMPLE_TEXTS[index].text);
      triggerToast(`Loaded "${SAMPLE_TEXTS[index].title}"`, 'info');
    }
  };

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onSelectSample={handleSelectSample}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section with Quick Sample Selector */}
        <Hero onSelectSample={handleSelectSample} />

        {/* Core Interactive Summarizer Workspace */}
        <Summarizer
          activeSampleText={activeSampleText}
          onToast={triggerToast}
        />

        {/* How It Works Pipeline */}
        <HowItWorks />

        {/* Feature Capabilities Grid */}
        <Features />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

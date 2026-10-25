import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon, Menu, X, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { checkHealth } from '../utils/api';

export default function Navbar({ theme, toggleTheme, onSelectSample }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    checkHealth().then(status => {
      if (mounted) setApiOnline(status);
    });

    const interval = setInterval(() => {
      checkHealth().then(status => {
        if (mounted) setApiOnline(status);
      });
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 dark:bg-slate-950/70 border-b border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Summari<span className="text-indigo-400">AI</span>
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
                  Gemini Flash 2.0
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo('summarizer')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Summarizer
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              How It Works
            </button>
            <a
              href="https://ai.google.dev/gemini-api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1"
            >
              API Docs
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </nav>

          {/* Right Action Group */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live Backend Indicator Badge */}
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              apiOnline === true
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : apiOnline === false
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {apiOnline === true ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Backend Connected</span>
                </>
              ) : apiOnline === false ? (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>API Offline</span>
                </>
              ) : (
                <span>Checking API...</span>
              )}
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300 transition-transform rotate-0" />
              )}
            </button>

            {/* Quick Demo CTA */}
            <button
              onClick={() => {
                onSelectSample && onSelectSample(0);
                scrollTo('summarizer');
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Quick Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => scrollTo('summarizer')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Summarizer Workspace
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Key Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              How It Works
            </button>
            <a
              href="https://ai.google.dev/gemini-api/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              <span>API Documentation</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <div className="pt-2">
              <button
                onClick={() => {
                  onSelectSample && onSelectSample(0);
                  scrollTo('summarizer');
                }}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-xs text-center"
              >
                Try Interactive Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

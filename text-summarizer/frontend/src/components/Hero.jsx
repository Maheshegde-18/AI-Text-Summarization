import React from 'react';
import { ArrowDown, Zap, Shield, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { SAMPLE_TEXTS } from '../utils/samples';

export default function Hero({ onSelectSample }) {
  const scrollToSummarizer = () => {
    const el = document.getElementById('summarizer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Powered by Google Gemini 2.0 Flash & GenAI SDK</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Turn Lengthy Text into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Concise, Actionable Summaries
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Condense essays, research papers, reports, and news articles with high semantic fidelity. 
          Extract key facts, arguments, and conclusions without losing crucial context.
        </p>

        {/* Main CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToSummarizer}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Launch Summarizer</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 text-sm font-semibold transition-all hover:border-slate-600"
          >
            <span>Explore Capabilities</span>
          </a>
        </div>

        {/* Quick Sample Selector Chips */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Or test instantly with a pre-loaded article:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectSample(idx);
                  scrollToSummarizer();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-all hover:scale-[1.02]"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sample.title}</span>
                <span className="text-[10px] text-slate-400">({sample.category})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-left backdrop-blur-sm">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-sm font-semibold text-white">Sub-Second Processing</div>
            <div className="text-xs text-slate-400 mt-0.5">Gemini 2.0 Flash architecture</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-left backdrop-blur-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-semibold text-white">100% Fact Retention</div>
            <div className="text-xs text-slate-400 mt-0.5">Zero hallucination instructions</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-left backdrop-blur-sm">
            <FileText className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-sm font-semibold text-white">10,000 Word Capacity</div>
            <div className="text-xs text-slate-400 mt-0.5">Automated chunking & merging</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-left backdrop-blur-sm">
            <Shield className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-sm font-semibold text-white">Strict Privacy</div>
            <div className="text-xs text-slate-400 mt-0.5">No storage or key leaks</div>
          </div>
        </div>
      </div>
    </section>
  );
}

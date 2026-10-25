import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Clipboard,
  ClipboardCheck,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  FileText,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Clock,
  Percent,
  ListFilter
} from 'lucide-react';
import { summarizeText } from '../utils/api';
import { SAMPLE_TEXTS } from '../utils/samples';

const MIN_WORDS = 20;
const MAX_WORDS = 10000;

export default function Summarizer({ activeSampleText, onToast }) {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'bullets' | 'raw'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const textareaRef = useRef(null);

  // Sync sample text from parent when user clicks sample chips in hero/navbar
  useEffect(() => {
    if (activeSampleText) {
      setInputText(activeSampleText);
      setError('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [activeSampleText]);

  // Clean up speech synthesis when component unmounts or summary changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Compute live word and character counts
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const isValidInput = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS;

  // Handle summarization submission
  const handleSummarize = async () => {
    if (!isValidInput || loading) return;

    setError('');
    setLoading(true);
    setSummary('');
    setStats(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Dynamic phase messages to give user feedback
    const phases = [
      'Initializing Gemini client...',
      'Analyzing text semantics & structure...',
      'Preserving key arguments & conclusions...',
      'Synthesizing concise summary...'
    ];
    let phaseIndex = 0;
    setLoadingPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setLoadingPhase(phases[phaseIndex]);
    }, 1200);

    try {
      const data = await summarizeText(inputText);
      clearInterval(phaseInterval);
      setSummary(data.summary);
      setStats(data.stats);
      onToast && onToast('Summary generated successfully!', 'success');
    } catch (err) {
      clearInterval(phaseInterval);
      setError(err.message || 'Failed to generate summary.');
      onToast && onToast(err.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to summarize
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isValidInput && !loading) {
        handleSummarize();
      }
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setError('');
        onToast && onToast('Text pasted from clipboard', 'info');
      }
    } catch {
      onToast && onToast('Could not access clipboard. Please paste manually.', 'error');
    }
  };

  // Clear text
  const handleClear = () => {
    setInputText('');
    setSummary('');
    setStats(null);
    setError('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Copy summary to clipboard
  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    onToast && onToast('Summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download summary as formatted .txt file
  const handleDownload = () => {
    if (!summary) return;
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const fileContent = `========================================================
AI-BASED TEXT SUMMARIZATION SYSTEM (GEMINI FLASH)
Generated: ${timestamp}
Original Words: ${stats?.originalWords || wordCount}
Summary Words:  ${stats?.summaryWords || summary.split(/\s+/).length}
Reduction:      ${stats?.reductionPercent || 0}%
========================================================

SUMMARY:
--------------------------------------------------------
${summary}
--------------------------------------------------------
`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast && onToast('Downloaded summary.txt', 'success');
  };

  // Text-To-Speech
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      onToast && onToast('Text-to-speech is not supported in this browser.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Format bullets from summary
  const getBulletPoints = () => {
    if (!summary) return [];
    // Split sentences or paragraphs into bullet points
    return summary
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  };

  // Calculate reading time saved (assuming average reading speed of 200 wpm)
  const timeSavedMinutes = stats
    ? Math.max(0, ((stats.originalWords - stats.summaryWords) / 200)).toFixed(1)
    : null;

  return (
    <section id="summarizer" className="py-12 md:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Interactive AI Summarizer
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Paste your source text below. The Gemini model preserves facts, dates, names, 
            and arguments without fabricated details.
          </p>
        </div>

        {/* Main Two-Panel Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ==================== LEFT PANEL: INPUT ==================== */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Header row with toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Source Document</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sample selector dropdown */}
                  <select
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      if (!isNaN(idx) && SAMPLE_TEXTS[idx]) {
                        setInputText(SAMPLE_TEXTS[idx].text);
                        setError('');
                        onToast && onToast(`Loaded sample: ${SAMPLE_TEXTS[idx].title}`, 'info');
                      }
                    }}
                    defaultValue=""
                    className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Load Sample...</option>
                    {SAMPLE_TEXTS.map((s, idx) => (
                      <option key={idx} value={idx}>{s.title}</option>
                    ))}
                  </select>

                  {/* Paste Button */}
                  <button
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                  </button>

                  {/* Clear Button */}
                  {inputText && (
                    <button
                      onClick={handleClear}
                      title="Clear text"
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative mt-4">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your text, essay, article, or research notes here (minimum 20 words)..."
                  className="w-full h-80 sm:h-96 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-400 text-sm leading-relaxed resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-normal transition-colors"
                />

                {/* Word & Character counter badges at bottom right of textarea */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-slate-300">
                    {wordCount.toLocaleString()} words
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-slate-400">
                    {charCount.toLocaleString()} chars
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Validation Status message */}
              <div className="text-xs">
                {wordCount === 0 ? (
                  <span className="text-slate-400">Paste or type text to get started</span>
                ) : wordCount < MIN_WORDS ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 inline" />
                    Need {MIN_WORDS - wordCount} more word(s)
                  </span>
                ) : wordCount > MAX_WORDS ? (
                  <span className="text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 inline" />
                    Exceeds maximum limit of {MAX_WORDS.toLocaleString()} words
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 inline" />
                    Ready to summarize (Press Ctrl+Enter)
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSummarize}
                disabled={!isValidInput || loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Summary</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>


          {/* ==================== RIGHT PANEL: OUTPUT ==================== */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Header row with reduction metrics & tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Gemini Summary</span>
                  {stats && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-semibold flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {stats.reductionPercent}% Shorter
                    </span>
                  )}
                </div>

                {/* View Tabs */}
                {summary && (
                  <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === 'summary'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Prose
                    </button>
                    <button
                      onClick={() => setActiveTab('bullets')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === 'bullets'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Key Takeaways
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === 'raw'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Raw
                    </button>
                  </div>
                )}
              </div>

              {/* Output Content Area */}
              <div className="mt-4">
                {/* 1. Loading State */}
                {loading && (
                  <div className="h-80 sm:h-96 rounded-xl border border-indigo-900/40 bg-indigo-950/10 p-6 flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-7 h-7 text-indigo-400 animate-spin" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">Synthesizing Summary</h3>
                    <p className="mt-1 text-xs text-indigo-300 font-mono tracking-wide">
                      {loadingPhase}
                    </p>

                    {/* Animated Shimmer Lines */}
                    <div className="w-full max-w-sm mt-6 space-y-2.5">
                      <div className="h-3.5 rounded-full shimmer" />
                      <div className="h-3.5 rounded-full shimmer w-5/6 mx-auto" />
                      <div className="h-3.5 rounded-full shimmer w-4/6 mx-auto" />
                    </div>
                  </div>
                )}

                {/* 2. Error State */}
                {!loading && error && (
                  <div className="h-80 sm:h-96 rounded-xl border border-red-900/50 bg-red-950/20 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center justify-center text-red-400 mb-3">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-white">Summarization Issue</h4>
                    <p className="mt-2 text-xs text-red-300 max-w-md leading-relaxed">
                      {error}
                    </p>
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={handleSummarize}
                        className="px-4 py-2 rounded-lg bg-red-800/60 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry Request
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Empty Placeholder State */}
                {!loading && !error && !summary && (
                  <div className="h-80 sm:h-96 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">No Summary Yet</h4>
                    <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                      Paste an article or choose a sample on the left, then click{' '}
                      <span className="text-indigo-300 font-medium">Generate Summary</span>.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80">Key Facts</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800/80">Zero Hallucination</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800/80">Instant Download</span>
                    </div>
                  </div>
                )}

                {/* 4. Result State */}
                {!loading && !error && summary && (
                  <div className="h-80 sm:h-96 overflow-y-auto p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-100 text-sm leading-relaxed">
                    {/* View: Prose */}
                    {activeTab === 'summary' && (
                      <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                        {summary}
                      </div>
                    )}

                    {/* View: Key Takeaways Bullets */}
                    {activeTab === 'bullets' && (
                      <ul className="space-y-2.5">
                        {getBulletPoints().map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* View: Raw Text */}
                    {activeTab === 'raw' && (
                      <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                        {summary}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Output Toolbar & Metrics */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              {summary ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Word count & Reading time saved */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono">
                      <strong>{stats?.summaryWords || summary.split(/\s+/).length}</strong> words
                    </span>
                    {timeSavedMinutes && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Clock className="w-3.5 h-3.5" />
                        Saved ~{timeSavedMinutes} min reading
                      </span>
                    )}
                  </div>

                  {/* Actions: Copy, Download, Speech */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Text-To-Speech */}
                    <button
                      onClick={handleToggleSpeak}
                      title={isSpeaking ? "Stop voice" : "Read summary aloud"}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isSpeaking
                          ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 animate-pulse'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-indigo-400" /> : <Volume2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={handleCopy}
                      className="p-2 sm:px-3 sm:py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center py-1">
                  Ready to process documents up to 10,000 words with Gemini 2.0 Flash
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

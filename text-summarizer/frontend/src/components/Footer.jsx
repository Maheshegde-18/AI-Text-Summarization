import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">SummariAI</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs sm:text-sm">
              An AI-powered academic and professional text summarization system utilizing 
              the official Google Gemini API (google-genai SDK) with semantic chunking and 
              factual preservation.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero client-side API key exposure. Secure backend proxy.</span>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Tech Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• React 19 + Vite</li>
              <li>• Tailwind CSS v4</li>
              <li>• Google Gemini 2.0 Flash</li>
              <li>• Official Python SDK (<code className="text-indigo-300">google-genai</code>)</li>
              <li>• Flask REST API + Streamlit</li>
            </ul>
          </div>

          {/* Quick References */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Resources & Docs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Google AI Studio API Keys</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Gemini API Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#summarizer"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Interactive Workspace
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Capabilities & Features
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} AI-Based Text Summarization System. College Project Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              Model: Gemini 2.0 Flash
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

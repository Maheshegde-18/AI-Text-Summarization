import React from 'react';
import {
  Cpu,
  Split,
  ShieldCheck,
  BarChart3,
  Volume2,
  FileDown,
  Layers,
  Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: "Gemini 2.0 Flash Engine",
    description: "Built on Google's modern Generative AI SDK (google-genai) with sub-second token latency and state-of-the-art factual comprehension.",
    tag: "Next-Gen AI"
  },
  {
    icon: Split,
    title: "Intelligent Semantic Chunking",
    description: "Documents exceeding chunk limits are split at paragraph and sentence boundaries, summarized independently, and harmonized into one cohesive result.",
    tag: "High Capacity"
  },
  {
    icon: ShieldCheck,
    title: "Zero-Hallucination Guardrails",
    description: "Strict prompt constraints enforce pure information preservation. The model preserves dates, figures, names, and arguments without making up facts.",
    tag: "Accurate"
  },
  {
    icon: BarChart3,
    title: "Real-Time Reduction Metrics",
    description: "Live word counts, character statistics, percentage compression ratios, and estimated reading time saved calculated on every generation.",
    tag: "Analytics"
  },
  {
    icon: Volume2,
    title: "Integrated Voice Synthesis",
    description: "Listen to your generated summary hands-free with built-in Web Speech API narration—ideal for auditory learners and multitasking.",
    tag: "Accessibility"
  },
  {
    icon: FileDown,
    title: "One-Click Formatted Export",
    description: "Download ready-to-share .txt reports complete with original/summary metadata, timestamps, and formatted headers.",
    tag: "Productivity"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 border-t border-slate-800/80 bg-slate-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered for Precision and Speed
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every component is crafted to deliver concise, trustworthy summaries with zero fluff, 
            backed by official Google GenAI infrastructure.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-900/60">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1 text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

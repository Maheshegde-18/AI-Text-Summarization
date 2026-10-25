import React from 'react';
import { FileUp, Cpu, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: "01",
    icon: FileUp,
    title: "Paste or Load Text",
    description: "Provide any text between 20 and 10,000 words. The client validates token counts and verifies formatting in real time."
  },
  {
    step: "02",
    icon: Cpu,
    title: "Semantic Analysis & Chunking",
    description: "Long documents are partitioned across natural paragraph boundaries. The Gemini API analyzes key premises, names, and conclusions."
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Executive Synthesis & Export",
    description: "Review executive summaries and bullet points. Listen via audio readout or download as formatted text files."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            From raw input to distilled clarity in three transparent, automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-indigo-400/40 font-mono">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 items-center justify-center text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

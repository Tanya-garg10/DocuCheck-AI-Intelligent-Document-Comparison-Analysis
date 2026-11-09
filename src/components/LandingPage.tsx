import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  FileText, 
  FileCheck2, 
  ChevronRight,
  ShieldCheck,
  GitCompare,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onStartComparing: () => void;
  onRunDemo: (type: 'employment' | 'legal_nda') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartComparing, onRunDemo }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC] text-[#171A2B]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E9EAF1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onStartComparing}>
            <div className="w-8 h-8 rounded-lg bg-[#6558E8] flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#171A2B]">
              DocuCheck <span className="text-[#6558E8]">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRunDemo('employment')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171A2B] hover:text-[#6558E8] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
              <span>Explore demo</span>
            </button>

            <button
              onClick={onStartComparing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Start Comparing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EDFF] text-[#6558E8] text-[11px] font-semibold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>AI-POWERED DOCUMENT INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171A2B] tracking-tight leading-[1.1] [text-wrap:balance]">
            Every document change.<br />
            <span className="text-[#6558E8]">One clear picture.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#777D91] max-w-xl mx-auto [text-wrap:balance]">
            Compare documents, uncover hidden differences, and understand what matters — powered by AI.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onStartComparing}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] active:bg-[#4638cb] rounded-xl shadow-xs shadow-[#6558E8]/20 transition-all cursor-pointer"
            >
              <span>Start comparing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRunDemo('employment')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#171A2B] bg-white hover:bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#6558E8]" />
              <span>Try sample demo</span>
            </button>
          </div>

          {/* Interactive Product Preview Panel */}
          <div className="mt-12 text-left relative max-w-4xl mx-auto">
            {/* Floating Badge */}
            <div className="absolute -top-4 right-4 z-20 px-3 py-1.5 bg-white rounded-xl border border-[#E9EAF1] shadow-md flex items-center gap-2 text-xs font-bold text-[#171A2B]">
              <span className="w-2 h-2 rounded-full bg-[#15966B]" />
              <span>3 important changes detected</span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xl shadow-slate-900/5 overflow-hidden">
              <div className="px-4 py-3 bg-[#F8F9FC] border-b border-[#E9EAF1] flex items-center justify-between text-xs font-semibold text-[#171A2B]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#6558E8]" />
                  <span>Employment_Offer_2024.pdf vs Offer_Revision_2025.pdf</span>
                </div>
                <span className="text-[11px] font-mono text-[#777D91]">Side-by-side diff</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E9EAF1] text-xs font-mono">
                {/* Original */}
                <div className="p-4 sm:p-5 bg-white space-y-2">
                  <div className="text-[11px] font-sans font-bold text-[#777D91] uppercase mb-2">Original</div>
                  <div className="p-2 bg-[#F8F9FC] border border-[#E9EAF1] rounded-lg">Employee: Rahul Sharma</div>
                  <div className="p-2 bg-rose-50 border border-rose-200 text-[#DF5966] rounded-lg line-through">Department: Engineering</div>
                  <div className="p-2 bg-rose-50 border border-rose-200 text-[#DF5966] rounded-lg line-through">Annual Salary: ₹6,00,000 INR</div>
                  <div className="p-2 bg-rose-50 border border-rose-200 text-[#DF5966] rounded-lg line-through">Work Location: Delhi</div>
                </div>

                {/* Updated */}
                <div className="p-4 sm:p-5 bg-white space-y-2">
                  <div className="text-[11px] font-sans font-bold text-[#6558E8] uppercase mb-2">Updated</div>
                  <div className="p-2 bg-[#F8F9FC] border border-[#E9EAF1] rounded-lg">Employee: Rahul Sharma</div>
                  <div className="p-2 bg-amber-50 border border-amber-200 text-[#D99A35] rounded-lg font-medium">Department: Product Engineering</div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-[#15966B] rounded-lg font-medium">Annual Salary: ₹7,20,000 INR (+20%)</div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-[#15966B] rounded-lg font-medium">Work Location: Noida (Relocated)</div>
                </div>
              </div>

              {/* Bottom Insight Strip */}
              <div className="p-3.5 bg-[#F0EDFF]/50 border-t border-[#E9EAF1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6558E8] shrink-0" />
                  <span className="text-[#171A2B]">
                    <strong className="text-[#6558E8]">AI Insight:</strong> Salary increased by ₹1,20,000 and location changed from Delhi to Noida.
                  </span>
                </div>
                <button
                  onClick={() => onRunDemo('employment')}
                  className="font-semibold text-[#6558E8] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Open live analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Signal Feature Pillars */}
      <section className="py-14 bg-white border-t border-[#E9EAF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F8F9FC] rounded-2xl border border-[#E9EAF1]">
              <div className="w-8 h-8 rounded-lg bg-[#F0EDFF] text-[#6558E8] flex items-center justify-center mb-3">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#171A2B]">Accurate Line & Word Diff</h3>
              <p className="mt-1.5 text-xs text-[#777D91] leading-relaxed">
                Deterministic text analysis highlighting additions in green, deletions in red, and adjustments in amber.
              </p>
            </div>

            <div className="p-6 bg-[#F8F9FC] rounded-2xl border border-[#E9EAF1]">
              <div className="w-8 h-8 rounded-lg bg-[#F0EDFF] text-[#6558E8] flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#171A2B]">Semantic Discrepancy Auditing</h3>
              <p className="mt-1.5 text-xs text-[#777D91] leading-relaxed">
                BharatCode AI automatically detects altered financial numbers, shifting deadlines, and omitted provisions.
              </p>
            </div>

            <div className="p-6 bg-[#F8F9FC] rounded-2xl border border-[#E9EAF1]">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#15966B] flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#171A2B]">In-Memory Privacy</h3>
              <p className="mt-1.5 text-xs text-[#777D91] leading-relaxed">
                Documents are processed purely in volatile RAM and never persisted to server disk. Zero model training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto py-6 bg-white border-t border-[#E9EAF1] text-xs text-[#777D91]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-[#171A2B]">
            DocuCheck AI <span className="font-normal text-[#777D91]">— Every change. Clearly understood.</span>
          </div>
          <div className="text-[11px] text-[#777D91]">
            PDF, DOCX & TXT · Model: qwen-3.8-27b
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { FileText, PlusCircle, History, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { AppView } from '../types/comparison';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onRunDemo: (type: 'employment' | 'legal_nda') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onRunDemo }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 transition-transform group-hover:scale-105">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900">
              DocuCheck <span className="text-indigo-600">AI</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'landing' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('new-comparison')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'new-comparison' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Compare Documents
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'history' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Comparison History
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'settings' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            BharatCode Engine
          </button>
        </nav>

        {/* Zone 3: Primary action & Quick Demo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onRunDemo('employment')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Instant Offer Letter demo with salary revision"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sample Demo</span>
          </button>

          <button
            onClick={() => onNavigate('new-comparison')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-100 transition-all whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Comparison</span>
          </button>
        </div>
      </div>
    </header>
  );
};

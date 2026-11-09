import React, { useState } from 'react';
import { 
  ComparisonRecord, 
  ActiveTab,
  SupportedLanguage,
  ChangeSeverity
} from '../types/comparison';
import { DiffViewer } from './DiffViewer';
import { ChatPanel } from './ChatPanel';
import { FormattedText } from './FormattedText';
import { exportComparisonPDF } from '../utils/pdfExport';
import { 
  Download, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  FileQuestion, 
  ListChecks, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileText,
  Activity,
  PlusCircle,
  MinusCircle,
  Edit3,
  Languages,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ComparisonResultsProps {
  record: ComparisonRecord;
  onNewComparison: () => void;
  onShowToast?: (msg: string) => void;
}

export const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  record,
  onNewComparison,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const stats = record.statistics;
  const ai = record.aiAnalysis;

  const handleDownload = () => {
    exportComparisonPDF(record);
    if (onShowToast) onShowToast('PDF Comparison Report downloaded successfully.');
  };

  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-rose-50 border-rose-200 text-[#DF5966]',
          label: 'High Severity Attention',
          indicator: 'bg-[#DF5966]',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 border-amber-200 text-[#D99A35]',
          label: 'Moderate Attention',
          indicator: 'bg-[#D99A35]',
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-[#15966B]',
          label: 'Routine / Low Variance',
          indicator: 'bg-[#15966B]',
        };
    }
  };

  const getSeverityBadge = (severity?: ChangeSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-50 text-[#DF5966] border-rose-200';
      case 'Important':
        return 'bg-amber-50 text-[#D99A35] border-amber-200';
      default:
        return 'bg-slate-50 text-[#777D91] border-slate-200';
    }
  };

  const riskInfo = getRiskBadge(ai.riskLevel);

  // Multilingual insights resolution
  const localizedData = language !== 'en' && ai.multilingual?.[language] ? ai.multilingual[language] : null;

  const currentSummary = localizedData?.executiveSummary || ai.executiveSummary;
  const currentRecommendations = localizedData?.recommendations || ai.recommendations;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            {/* Metadata Bar */}
            <div className="flex items-center gap-2 text-xs text-[#777D91] font-mono mb-1.5 flex-wrap">
              <span>{new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>·</span>
              <span className="text-[#6558E8] font-semibold">{ai.modelUsed}</span>
              <span>·</span>
              <span className={`inline-flex items-center gap-1 font-semibold ${riskInfo.bg.split(' ')[2] || 'text-[#171A2B]'}`}>
                Risk: {ai.riskLevel}
              </span>
              <span>·</span>
              <span className="text-[#15966B] font-semibold">Grounded Analysis</span>
            </div>

            {/* Document Names */}
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#171A2B] truncate">
              <span className="truncate max-w-[280px] sm:max-w-[360px]">{record.originalDocumentName}</span>
              <span className="text-[#777D91] font-normal text-xs">vs</span>
              <span className="truncate max-w-[280px] sm:max-w-[360px] text-[#6558E8]">{record.updatedDocumentName}</span>
            </div>
          </div>

          {/* Action CTAs & Language Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Multilingual Selector */}
            <div className="flex items-center bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl p-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-[#6558E8] ml-1.5 mr-1" />
              <button
                onClick={() => {
                  setLanguage('en');
                  if (onShowToast) onShowToast('Switched insights language to English');
                }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  language === 'en'
                    ? 'bg-white text-[#6558E8] shadow-2xs font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLanguage('hi');
                  if (onShowToast) onShowToast('अंतर्दृष्टि हिंदी में प्रदर्शित की जा रही है');
                }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  language === 'hi'
                    ? 'bg-white text-[#6558E8] shadow-2xs font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => {
                  setLanguage('hi-en');
                  if (onShowToast) onShowToast('Hinglish insights active');
                }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  language === 'hi-en'
                    ? 'bg-white text-[#6558E8] shadow-2xs font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                Hinglish
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#171A2B] bg-white hover:bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#777D91]" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onNewComparison}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Polished Statistic Cards with Severity Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {/* Total changes */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
          <div className="flex items-center justify-between text-[#777D91] mb-2">
            <span className="text-xs font-medium">Total changes</span>
            <Activity className="w-4 h-4 text-[#6558E8]" />
          </div>
          <div className="text-2xl font-bold text-[#171A2B] font-mono tabular-nums">
            {stats.totalChanges}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#777D91] mt-1">
            {stats.criticalChanges > 0 && (
              <span className="text-[#DF5966] font-semibold">{stats.criticalChanges} Critical</span>
            )}
            {stats.criticalChanges > 0 && stats.importantChanges > 0 && <span>·</span>}
            {stats.importantChanges > 0 && (
              <span className="text-[#D99A35] font-semibold">{stats.importantChanges} Important</span>
            )}
          </div>
        </div>

        {/* Added */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
          <div className="flex items-center justify-between text-[#15966B] mb-2">
            <span className="text-xs font-medium">Added</span>
            <PlusCircle className="w-4 h-4 text-[#15966B]" />
          </div>
          <div className="text-2xl font-bold text-[#15966B] font-mono tabular-nums">
            +{stats.addedLines}
          </div>
          <span className="text-[10px] text-[#777D91] mt-0.5 block">Newly inserted lines</span>
        </div>

        {/* Removed */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
          <div className="flex items-center justify-between text-[#DF5966] mb-2">
            <span className="text-xs font-medium">Removed</span>
            <MinusCircle className="w-4 h-4 text-[#DF5966]" />
          </div>
          <div className="text-2xl font-bold text-[#DF5966] font-mono tabular-nums">
            -{stats.removedLines}
          </div>
          <span className="text-[10px] text-[#777D91] mt-0.5 block">Omitted or deleted</span>
        </div>

        {/* Modified */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
          <div className="flex items-center justify-between text-[#D99A35] mb-2">
            <span className="text-xs font-medium">Modified</span>
            <Edit3 className="w-4 h-4 text-[#D99A35]" />
          </div>
          <div className="text-2xl font-bold text-[#D99A35] font-mono tabular-nums">
            ~{stats.modifiedLines}
          </div>
          <span className="text-[10px] text-[#777D91] mt-0.5 block">Adjusted clauses</span>
        </div>
      </div>

      {/* Navigation Tabs (5 Rich Tabs) */}
      <div className="border-b border-[#E9EAF1] mb-6">
        <div className="flex space-x-2 sm:space-x-8 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#6558E8] text-[#6558E8]'
                : 'border-transparent text-[#777D91] hover:text-[#171A2B]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('differences')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'differences'
                ? 'border-[#6558E8] text-[#6558E8]'
                : 'border-transparent text-[#777D91] hover:text-[#171A2B]'
            }`}
          >
            <span>Detailed Changes</span>
            <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#6558E8]">
              {stats.totalChanges}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('missing')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'missing'
                ? 'border-[#6558E8] text-[#6558E8]'
                : 'border-transparent text-[#777D91] hover:text-[#171A2B]'
            }`}
          >
            <span>Missing Information</span>
            {ai.missingInformation.length > 0 && (
              <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-amber-100 text-[#D99A35]">
                {ai.missingInformation.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ai-insights'
                ? 'border-[#6558E8] text-[#6558E8]'
                : 'border-transparent text-[#777D91] hover:text-[#171A2B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>AI Insights</span>
            {language !== 'en' && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#F0EDFF] text-[#6558E8]">
                {language}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-[#6558E8] text-[#6558E8]'
                : 'border-transparent text-[#777D91] hover:text-[#171A2B]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>Chat with Documents</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#15966B] border border-emerald-200">
              New
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm font-bold text-[#171A2B] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6558E8]" />
                <span>Executive Summary</span>
                {language !== 'en' && (
                  <span className="text-[11px] font-normal text-[#777D91]">
                    ({language === 'hi' ? 'हिंदी अनुवाद' : 'Hinglish Mode'})
                  </span>
                )}
              </h2>

              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${riskInfo.bg}`}>
                Risk: {ai.riskLevel}
              </span>
            </div>

            <FormattedText
              content={currentSummary}
              className="text-xs sm:text-sm text-[#171A2B] leading-relaxed"
            />

            {ai.isFallback && (
              <div className="mt-4 p-3 bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl text-xs text-[#777D91] flex items-center justify-between">
                <span>Deterministic local engine verified. Set <code className="font-mono text-[#6558E8]">BHARATCODE_API_KEY</code> for cloud LLM reasoning.</span>
              </div>
            )}
          </div>

          {/* Highlights & Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Changes with Severity Badges */}
            <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6">
              <h3 className="text-sm font-bold text-[#171A2B] mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#6558E8]" />
                <span>Top Changes Requiring Review</span>
              </h3>
              <div className="space-y-2.5">
                {ai.importantChanges.slice(0, 4).map((change, idx) => (
                  <div key={idx} className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#171A2B]">
                        <span>{change.title}</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${getSeverityBadge(change.severity)}`}>
                          {change.severity}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-[#777D91]">{change.category}</span>
                    </div>
                    <FormattedText content={change.description} className="text-xs text-[#777D91] leading-relaxed" />
                    {change.whyItMatters && (
                      <div className="text-[11px] text-[#6558E8] font-medium mt-1 flex items-start gap-1">
                        <span className="shrink-0 font-bold">Impact:</span>
                        <FormattedText content={change.whyItMatters} className="inline flex-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171A2B] mb-3 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#6558E8]" />
                  <span>Recommended Review Steps</span>
                </h3>
                <ul className="space-y-2.5">
                  {currentRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-[#171A2B] flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15966B] shrink-0 mt-0.5" />
                      <FormattedText content={rec} className="flex-1" />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E9EAF1] flex items-center justify-between">
                <span className="text-xs text-[#777D91]">
                  Similarity Score: <strong className="text-[#171A2B]">{stats.similarityScore}%</strong>
                </span>
                <button
                  onClick={() => setActiveTab('differences')}
                  className="text-xs font-semibold text-[#6558E8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Detailed Changes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED CHANGES */}
      {activeTab === 'differences' && (
        <div>
          <DiffViewer
            lineDiffs={record.lineDiffs}
            originalName={record.originalDocumentName}
            updatedName={record.updatedDocumentName}
          />
        </div>
      )}

      {/* TAB 3: MISSING INFORMATION */}
      {activeTab === 'missing' && (
        <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#171A2B] flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-[#D99A35]" />
              <span>Missing Information & Omitted Provisions</span>
            </h2>
            <p className="text-xs text-[#777D91] mt-1">
              Clauses or metadata present in the original reference that were dropped in the updated document.
            </p>
          </div>

          {ai.missingInformation.length === 0 ? (
            <div className="p-10 text-center bg-[#F8F9FC] rounded-xl border border-[#E9EAF1] text-xs text-[#777D91]">
              No missing clauses or omitted provisions were detected between document versions.
            </div>
          ) : (
            <div className="space-y-3">
              {ai.missingInformation.map((item, idx) => (
                <div key={idx} className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-950">{item.field}</span>
                    <span className="text-[10px] uppercase font-mono text-[#D99A35] bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                      Omitted
                    </span>
                  </div>
                  <p className="text-xs text-[#171A2B] mb-2">{item.description}</p>
                  <p className="text-[11px] text-[#D99A35] font-semibold">
                    Impact: {item.impact}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI INSIGHTS */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6558E8]" />
                <h2 className="text-base font-bold text-[#171A2B]">
                  BharatCode AI Findings ({ai.modelUsed})
                </h2>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${riskInfo.bg}`}>
                Risk: {ai.riskLevel}
              </span>
            </div>

            <FormattedText
              content={currentSummary}
              className="text-xs sm:text-sm text-[#171A2B] leading-relaxed mb-6"
            />

            {/* Inconsistencies Section */}
            {ai.inconsistencies.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#E9EAF1]">
                <h3 className="text-sm font-bold text-[#171A2B] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#DF5966]" />
                  <span>Potential Contradictions & Discrepancies</span>
                </h3>
                <div className="space-y-3">
                  {ai.inconsistencies.map((inc, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-950 block">{inc.issue}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getSeverityBadge(inc.risk)}`}>
                          {inc.risk}
                        </span>
                      </div>
                      <FormattedText content={inc.detail} className="text-xs text-[#777D91] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Substantive Changes with Entity Types and Before/After */}
            <div className="mt-6 pt-6 border-t border-[#E9EAF1]">
              <h3 className="text-sm font-bold text-[#171A2B] mb-3">
                Key Structural & Substantive Changes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ai.importantChanges.map((change, idx) => (
                  <div key={idx} className="p-4 bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#171A2B]">
                          <span>{change.title}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getSeverityBadge(change.severity)}`}>
                            {change.severity}
                          </span>
                        </div>
                        {change.entityType && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white border border-[#E9EAF1] rounded-md text-[#6558E8] font-semibold">
                            {change.entityType}
                          </span>
                        )}
                      </div>
                      <FormattedText content={change.description} className="text-xs text-[#777D91] mt-1 leading-relaxed" />
                      
                      {/* Before / After */}
                      {(change.beforeValue || change.afterValue) && (
                        <div className="mt-2.5 pt-2 border-t border-[#E9EAF1] space-y-1 text-[11px] font-mono">
                          {change.beforeValue && (
                            <div className="text-[#DF5966]">
                              <span className="font-semibold select-none">Was: </span>
                              <span>{change.beforeValue}</span>
                            </div>
                          )}
                          {change.afterValue && (
                            <div className="text-[#15966B] font-medium">
                              <span className="font-semibold select-none">Now: </span>
                              <span>{change.afterValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {change.whyItMatters && (
                      <div className="mt-3 pt-2 border-t border-[#E9EAF1] text-[11px] text-[#6558E8] font-medium flex items-start gap-1">
                        <span className="shrink-0 font-bold">Why it matters:</span>
                        <FormattedText content={change.whyItMatters} className="inline flex-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Notice */}
            <div className="mt-6 text-[11px] text-[#777D91] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#777D91] shrink-0" />
              <span>Advisory: AI findings are guidance interpretations. Verify critical clauses in the side-by-side diff.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHAT WITH DOCUMENTS */}
      {activeTab === 'chat' && (
        <div>
          <ChatPanel
            originalText={record.originalText}
            updatedText={record.updatedText}
            originalName={record.originalDocumentName}
            updatedName={record.updatedDocumentName}
          />
        </div>
      )}
    </div>
  );
};

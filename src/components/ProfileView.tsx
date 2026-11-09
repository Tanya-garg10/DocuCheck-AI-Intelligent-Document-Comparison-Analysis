import React from 'react';
import { ComparisonRecord } from '../types/comparison';
import { 
  User, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Plus, 
  Calendar, 
  Layers,
  ArrowRight,
  Sparkles,
  GitCompare,
  Mail
} from 'lucide-react';

interface ProfileViewProps {
  history: ComparisonRecord[];
  onNewComparison: () => void;
  onSelectRecord: (record: ComparisonRecord) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  history,
  onNewComparison,
  onSelectRecord,
}) => {
  // Aggregate statistics across all comparisons
  const totalComparisons = history.length;
  const totalDocumentsAnalyzed = history.length * 2; // Original + Updated

  const totalChanges = history.reduce((sum, item) => sum + (item.statistics?.totalChanges || 0), 0);
  const totalAdded = history.reduce((sum, item) => sum + (item.statistics?.addedLines || 0), 0);
  const totalRemoved = history.reduce((sum, item) => sum + (item.statistics?.removedLines || 0), 0);
  const totalModified = history.reduce((sum, item) => sum + (item.statistics?.modifiedLines || 0), 0);

  const avgSimilarity = totalComparisons > 0
    ? Math.round(history.reduce((sum, item) => sum + (item.statistics?.similarityScore || 0), 0) / totalComparisons)
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6 sm:p-7 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[#F0EDFF] text-[#6558E8] border border-[#6558E8]/20 flex items-center justify-center font-bold text-xl shadow-xs">
              TG
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#171A2B]">Tanya Garg</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#F0EDFF] text-[#6558E8] text-[10px] font-bold">
                  Pro Workspace
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#777D91] mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#777D91]" />
                  tanyagarg5315@gmail.com
                </span>
                <span>·</span>
                <span>Document Analyst</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNewComparison}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New comparison</span>
          </button>
        </div>
      </div>

      {/* Analytics Grid: Documents Analyzed & Activity Stats */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-[#171A2B] mb-3">Analysis Metrics & Activity</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Documents Analyzed */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
            <span className="text-xs font-medium text-[#777D91] block">Documents Analyzed</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#171A2B] font-mono tabular-nums mt-1.5">
              {totalDocumentsAnalyzed}
            </div>
            <span className="text-[10px] text-[#6558E8] font-semibold mt-0.5 block">
              {totalComparisons} comparison sessions
            </span>
          </div>

          {/* Total Changes Detected */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
            <span className="text-xs font-medium text-[#777D91] block">Total Changes Found</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#171A2B] font-mono tabular-nums mt-1.5">
              {totalChanges}
            </div>
            <span className="text-[10px] text-[#777D91] mt-0.5 block">
              Lines & provisions
            </span>
          </div>

          {/* Added & Removed Breakdown */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
            <span className="text-xs font-medium text-[#777D91] block">Added / Removed</span>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1.5 flex items-center gap-2">
              <span className="text-[#15966B]">+{totalAdded}</span>
              <span className="text-[#777D91] font-normal text-sm">/</span>
              <span className="text-[#DF5966]">-{totalRemoved}</span>
            </div>
            <span className="text-[10px] text-[#777D91] mt-0.5 block">
              Across versions
            </span>
          </div>

          {/* Average Similarity */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs">
            <span className="text-xs font-medium text-[#777D91] block">Avg. Similarity</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#171A2B] font-mono tabular-nums mt-1.5">
              {avgSimilarity}%
            </div>
            <span className="text-[10px] text-[#777D91] mt-0.5 block">
              Consistency score
            </span>
          </div>
        </div>
      </div>

      {/* Analyzed Documents Log */}
      <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6 mb-7">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E9EAF1]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6558E8]" />
            <h3 className="text-sm font-bold text-[#171A2B]">Analyzed Documents Log</h3>
          </div>
          <span className="text-xs text-[#777D91] font-mono tabular-nums">
            {totalComparisons} records
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#777D91]">
            No documents analyzed yet. Click <strong>"New comparison"</strong> to run your first analysis.
          </div>
        ) : (
          <div className="divide-y divide-[#E9EAF1]/70">
            {history.map((record) => (
              <div 
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F9FC] px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#171A2B] group-hover:text-[#6558E8] transition-colors truncate">
                    <span className="truncate max-w-[220px] sm:max-w-[280px]">{record.originalDocumentName}</span>
                    <span className="text-[#777D91] font-normal">→</span>
                    <span className="truncate max-w-[220px] sm:max-w-[280px] text-[#6558E8]">{record.updatedDocumentName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#777D91] font-mono mt-1">
                    <span>{new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <span className="text-[#171A2B] font-medium">{record.statistics.totalChanges} changes</span>
                    <span>·</span>
                    <span>Risk: {record.aiAnalysis.riskLevel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6558E8] shrink-0 self-end sm:self-center">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Settings & Privacy Summary */}
      <div className="p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15966B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#171A2B] block">Data Privacy Guarantee</span>
            <span className="text-[#777D91]">Documents are processed in volatile RAM with zero permanent disk storage.</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#777D91] bg-[#F8F9FC] px-3 py-1 rounded-lg border border-[#E9EAF1]">
          Model: qwen-3.8-27b
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Plus, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  History as HistoryIcon, 
  FileSearch,
  Download
} from 'lucide-react';
import { ComparisonRecord } from '../types/comparison';

interface DashboardOverviewProps {
  history: ComparisonRecord[];
  onNewComparison: () => void;
  onSelectRecord: (record: ComparisonRecord) => void;
  onRunDemo: (type: 'employment' | 'legal_nda') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  history,
  onNewComparison,
  onSelectRecord,
  onRunDemo,
}) => {
  const recentItems = history.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A2B]">
            Good to see you.
          </h1>
          <p className="mt-1 text-sm text-[#777D91]">
            Your document intelligence workspace.
          </p>
        </div>

        <button
          onClick={onNewComparison}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] active:bg-[#4638cb] rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New comparison</span>
        </button>
      </div>

      {/* Quick Test Demo Strip */}
      <div className="mb-7 p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171A2B]">
            <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>Try sample documents</span>
          </div>
          <p className="text-xs text-[#777D91] mt-0.5">
            Test the comparison engine instantly without uploading files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onRunDemo('employment')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] hover:text-[#6558E8] border border-[#E9EAF1] rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>Offer Letter (Salary Rev.)</span>
            <ArrowRight className="w-3 h-3 text-[#777D91]" />
          </button>

          <button
            onClick={() => onRunDemo('legal_nda')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] hover:text-[#6558E8] border border-[#E9EAF1] rounded-xl transition-all cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5 text-[#6558E8]" />
            <span>Legal NDA (Terms Rev.)</span>
            <ArrowRight className="w-3 h-3 text-[#777D91]" />
          </button>
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#171A2B]">Recent Comparisons</h2>
          {history.length > 0 && (
            <span className="text-xs text-[#777D91] font-mono tabular-nums">
              {history.length} logged
            </span>
          )}
        </div>

        {history.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 bg-white rounded-2xl border border-[#E9EAF1] text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F9FC] border border-[#E9EAF1] flex items-center justify-center text-[#777D91] mx-auto mb-3">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#171A2B]">No comparisons yet</h3>
            <p className="text-xs text-[#777D91] mt-1.5 max-w-sm mx-auto">
              Upload two versions of a document to compare them and view findings here.
            </p>
            <div className="mt-5">
              <button
                onClick={onNewComparison}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start first comparison</span>
              </button>
            </div>
          </div>
        ) : (
          /* Clean Recent Comparisons Cards */
          <div className="space-y-2.5">
            {recentItems.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                className="p-4 bg-white hover:bg-[#F8F9FC] rounded-2xl border border-[#E9EAF1] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#777D91] font-mono mb-1">
                    <span>
                      {new Date(rec.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span className="text-[#6558E8] font-semibold">{rec.statistics.totalChanges} changes</span>
                    <span>·</span>
                    <span>Similarity: {rec.statistics.similarityScore}%</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-[#171A2B] group-hover:text-[#6558E8] transition-colors truncate">
                    <span className="truncate">{rec.originalDocumentName}</span>
                    <span className="text-[#777D91] font-normal">→</span>
                    <span className="truncate">{rec.updatedDocumentName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                    <span className="text-[#15966B]">+{rec.statistics.addedLines}</span>
                    <span className="text-[#DF5966]">-{rec.statistics.removedLines}</span>
                    <span className="text-[#D99A35]">~{rec.statistics.modifiedLines}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#6558E8] flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

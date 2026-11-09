import React from 'react';
import { ComparisonRecord } from '../types/comparison';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Download,
  Calendar,
  Layers,
  FileCheck2
} from 'lucide-react';
import { exportComparisonPDF } from '../utils/pdfExport';

interface ComparisonHistoryProps {
  history: ComparisonRecord[];
  onSelectRecord: (record: ComparisonRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onStartNew: () => void;
  onShowToast?: (msg: string) => void;
}

export const ComparisonHistory: React.FC<ComparisonHistoryProps> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onStartNew,
  onShowToast,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A2B]">
            Comparison History
          </h1>
          <p className="mt-1 text-sm text-[#777D91]">
            Document comparisons logged in your current session.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClearAll();
                if (onShowToast) onShowToast('Comparison history cleared.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#DF5966] bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onStartNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Comparison</span>
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="p-12 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F9FC] border border-[#E9EAF1] flex items-center justify-center text-[#777D91] mx-auto mb-4">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171A2B]">No comparisons yet</h3>
          <p className="text-xs text-[#777D91] mt-1.5 leading-relaxed">
            When you run comparisons, records are securely indexed here for review.
          </p>
          <div className="mt-6">
            <button
              onClick={onStartNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start your first comparison</span>
            </button>
          </div>
        </div>
      ) : (
        /* History Items List */
        <div className="space-y-3">
          {history.map((record) => {
            const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={record.id}
                className="p-5 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6558E8]/30 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#777D91] font-mono mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#6558E8] font-semibold">{record.aiAnalysis.modelUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span>Risk: {record.aiAnalysis.riskLevel}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-[#171A2B] truncate">
                    <span className="truncate max-w-[260px]">{record.originalDocumentName}</span>
                    <span className="text-[#777D91] font-normal text-xs">→</span>
                    <span className="truncate max-w-[260px] text-[#6558E8]">{record.updatedDocumentName}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs font-mono tabular-nums text-[#777D91]">
                    <span>Total changes: <strong className="text-[#171A2B]">{record.statistics.totalChanges}</strong></span>
                    <span>Added: <strong className="text-[#15966B]">+{record.statistics.addedLines}</strong></span>
                    <span>Removed: <strong className="text-[#DF5966]">-{record.statistics.removedLines}</strong></span>
                    <span>Similarity: <strong className="text-[#171A2B]">{record.statistics.similarityScore}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => {
                      exportComparisonPDF(record);
                      if (onShowToast) onShowToast('PDF Report downloaded.');
                    }}
                    title="Download PDF report"
                    className="p-2 text-[#777D91] hover:text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] rounded-xl border border-[#E9EAF1] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onDeleteRecord(record.id);
                      if (onShowToast) onShowToast('Comparison record removed.');
                    }}
                    title="Delete record"
                    className="p-2 text-[#DF5966] bg-[#F8F9FC] hover:bg-rose-50 rounded-xl border border-[#E9EAF1] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectRecord(record)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { LineDiff, ChangeType, ChangeSeverity } from '../types/comparison';
import { 
  Search, 
  Columns2, 
  AlignJustify, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  ArrowRight,
  Info
} from 'lucide-react';
import { FormattedText } from './FormattedText';

interface DiffViewerProps {
  lineDiffs: LineDiff[];
  originalName: string;
  updatedName: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  lineDiffs,
  originalName,
  updatedName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'added' | 'removed' | 'modified'>('all');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [selectedDiffIndex, setSelectedDiffIndex] = useState<number | null>(null);

  // List of all non-unchanged differences for navigation
  const changedIndices = useMemo(() => {
    return lineDiffs
      .map((d, index) => (d.type !== 'unchanged' ? index : -1))
      .filter((idx) => idx !== -1);
  }, [lineDiffs]);

  const currentChangeNumber = useMemo(() => {
    if (selectedDiffIndex === null) return 0;
    const pos = changedIndices.indexOf(selectedDiffIndex);
    return pos !== -1 ? pos + 1 : 0;
  }, [selectedDiffIndex, changedIndices]);

  const handlePrevChange = () => {
    if (changedIndices.length === 0) return;
    if (selectedDiffIndex === null) {
      setSelectedDiffIndex(changedIndices[0]);
      return;
    }
    const currentPos = changedIndices.indexOf(selectedDiffIndex);
    if (currentPos > 0) {
      setSelectedDiffIndex(changedIndices[currentPos - 1]);
    } else {
      // Loop to end
      setSelectedDiffIndex(changedIndices[changedIndices.length - 1]);
    }
  };

  const handleNextChange = () => {
    if (changedIndices.length === 0) return;
    if (selectedDiffIndex === null) {
      setSelectedDiffIndex(changedIndices[0]);
      return;
    }
    const currentPos = changedIndices.indexOf(selectedDiffIndex);
    if (currentPos < changedIndices.length - 1) {
      setSelectedDiffIndex(changedIndices[currentPos + 1]);
    } else {
      // Loop to start
      setSelectedDiffIndex(changedIndices[0]);
    }
  };

  const filteredDiffs = useMemo(() => {
    return lineDiffs.filter((item) => {
      // Type filter
      if (filterType !== 'all' && filterType !== item.type) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const origMatch = item.originalText?.toLowerCase().includes(q) ?? false;
        const updMatch = item.updatedText?.toLowerCase().includes(q) ?? false;
        return origMatch || updMatch;
      }

      return true;
    });
  }, [lineDiffs, filterType, searchQuery]);

  const activeDiff = selectedDiffIndex !== null ? lineDiffs[selectedDiffIndex] : null;

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

  return (
    <div className="space-y-4">
      {/* Diff Container Card */}
      <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs overflow-hidden">
        {/* Diff Controls Toolbar */}
        <div className="p-4 bg-[#F8F9FC] border-b border-[#E9EAF1] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777D91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search text or clause changes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E9EAF1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6558E8] text-[#171A2B] placeholder:text-[#777D91]"
            />
          </div>

          {/* Stepper Controls & View Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Change Stepper Navigation */}
            {changedIndices.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E9EAF1] rounded-xl text-xs">
                <span className="text-[#777D91] text-[11px] font-mono mr-1">
                  {currentChangeNumber > 0 ? (
                    <>
                      Change <strong className="text-[#171A2B]">{currentChangeNumber}</strong> of {changedIndices.length}
                    </>
                  ) : (
                    <>{changedIndices.length} Changes</>
                  )}
                </span>
                <button
                  onClick={handlePrevChange}
                  title="Previous change"
                  className="p-1 hover:bg-[#F8F9FC] text-[#777D91] hover:text-[#171A2B] rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextChange}
                  title="Next change"
                  className="p-1 hover:bg-[#F8F9FC] text-[#777D91] hover:text-[#171A2B] rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Change Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[#E9EAF1] rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#F0EDFF] text-[#6558E8] font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('modified')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'modified'
                    ? 'bg-amber-50 text-[#D99A35] font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                Modified
              </button>
              <button
                onClick={() => setFilterType('added')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'added'
                    ? 'bg-emerald-50 text-[#15966B] font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                Added
              </button>
              <button
                onClick={() => setFilterType('removed')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'removed'
                    ? 'bg-rose-50 text-[#DF5966] font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                Removed
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[#E9EAF1] rounded-xl text-xs">
              <button
                onClick={() => setViewMode('side-by-side')}
                title="Side-by-side view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'side-by-side' ? 'bg-[#F0EDFF] text-[#6558E8]' : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('unified')}
                title="Unified list view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'unified' ? 'bg-[#F0EDFF] text-[#6558E8]' : 'text-[#777D91] hover:text-[#171A2B]'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="px-4 py-2 bg-[#F8F9FC]/60 border-b border-[#E9EAF1] text-[11px] text-[#777D91] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#6558E8]" />
            <span>Click any highlighted change row below to inspect AI annotations, category, and impact rationale.</span>
          </span>
          <span className="text-[10px] font-mono">Use &lt; &gt; buttons to navigate changes</span>
        </div>

        {/* Main Diff Content */}
        {filteredDiffs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#777D91]">
            No differences match the current filter or search criteria.
          </div>
        ) : viewMode === 'side-by-side' ? (
          /* SIDE-BY-SIDE VIEW */
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Column Headers */}
              <div className="grid grid-cols-2 bg-[#F8F9FC] border-b border-[#E9EAF1] text-xs font-semibold text-[#171A2B]">
                <div className="px-4 py-2.5 border-r border-[#E9EAF1] truncate">
                  Original: {originalName}
                </div>
                <div className="px-4 py-2.5 truncate text-[#6558E8]">
                  Updated: {updatedName}
                </div>
              </div>

              {/* Line rows */}
              <div className="font-mono text-[12px] leading-5 divide-y divide-[#E9EAF1]/70">
                {filteredDiffs.map((diff, index) => {
                  const globalIndex = lineDiffs.indexOf(diff);
                  const isSelected = selectedDiffIndex === globalIndex;
                  const isChange = diff.type !== 'unchanged';

                  let leftBg = 'bg-white text-[#171A2B]';
                  let rightBg = 'bg-white text-[#171A2B]';
                  let leftText = diff.originalText ?? '';
                  let rightText = diff.updatedText ?? '';

                  if (diff.type === 'modified') {
                    leftBg = isSelected ? 'bg-amber-100/90 text-amber-950 ring-1 ring-amber-400' : 'bg-amber-50/70 text-amber-950';
                    rightBg = isSelected ? 'bg-amber-100/90 text-amber-950 font-medium ring-1 ring-amber-400' : 'bg-amber-50/70 text-amber-950 font-medium';
                  } else if (diff.type === 'removed') {
                    leftBg = isSelected ? 'bg-rose-100 text-rose-950 ring-1 ring-rose-400' : 'bg-rose-50 text-rose-950';
                    rightBg = 'bg-[#F8F9FC] text-[#777D91]/40';
                    rightText = '—';
                  } else if (diff.type === 'added') {
                    leftBg = 'bg-[#F8F9FC] text-[#777D91]/40';
                    rightBg = isSelected ? 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400 font-medium' : 'bg-emerald-50 text-emerald-950 font-medium';
                    leftText = '—';
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isChange) {
                          setSelectedDiffIndex(globalIndex);
                        }
                      }}
                      className={`grid grid-cols-2 transition-colors ${
                        isChange ? 'cursor-pointer hover:bg-[#F0EDFF]/30' : ''
                      } ${isSelected ? 'ring-2 ring-[#6558E8] ring-inset z-10' : ''}`}
                    >
                      {/* Left Column (Original) */}
                      <div className={`flex items-start px-3 py-1.5 border-r border-[#E9EAF1] ${leftBg}`}>
                        <span className="w-8 shrink-0 text-[#777D91] select-none text-[11px] tabular-nums text-right pr-2">
                          {diff.originalNumber ?? ''}
                        </span>
                        <span className="w-4 shrink-0 text-[#DF5966] select-none font-bold">
                          {diff.type === 'removed' ? '-' : diff.type === 'modified' ? '~' : ''}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-words">{leftText}</span>
                      </div>

                      {/* Right Column (Updated) */}
                      <div className={`flex items-start px-3 py-1.5 ${rightBg}`}>
                        <span className="w-8 shrink-0 text-[#777D91] select-none text-[11px] tabular-nums text-right pr-2">
                          {diff.updatedNumber ?? ''}
                        </span>
                        <span className="w-4 shrink-0 font-bold select-none text-[#15966B]">
                          {diff.type === 'added' ? '+' : diff.type === 'modified' ? '~' : ''}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-words">{rightText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* UNIFIED VIEW */
          <div className="overflow-x-auto font-mono text-[12px] leading-5 divide-y divide-[#E9EAF1]/70">
            {filteredDiffs.map((diff, index) => {
              const globalIndex = lineDiffs.indexOf(diff);
              const isSelected = selectedDiffIndex === globalIndex;
              const isChange = diff.type !== 'unchanged';

              if (diff.type === 'modified') {
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDiffIndex(globalIndex)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-[#6558E8] ring-inset' : 'hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start px-4 py-1.5 bg-rose-50 text-rose-950">
                      <span className="w-10 text-[#777D91] select-none text-[11px] tabular-nums text-right pr-2">
                        {diff.originalNumber ?? ''}
                      </span>
                      <span className="w-5 text-[#DF5966] font-bold select-none">-</span>
                      <span className="flex-1 whitespace-pre-wrap break-words">{diff.originalText}</span>
                    </div>
                    <div className="flex items-start px-4 py-1.5 bg-emerald-50 text-emerald-950 font-medium">
                      <span className="w-10 text-[#777D91] select-none text-[11px] tabular-nums text-right pr-2">
                        {diff.updatedNumber ?? ''}
                      </span>
                      <span className="w-5 text-[#15966B] font-bold select-none">+</span>
                      <span className="flex-1 whitespace-pre-wrap break-words">{diff.updatedText}</span>
                    </div>
                  </div>
                );
              }

              let rowBg = 'bg-white text-[#171A2B]';
              let symbol = ' ';
              let text = diff.updatedText || diff.originalText || '';
              let lineNum = diff.updatedNumber || diff.originalNumber;

              if (diff.type === 'added') {
                rowBg = isSelected ? 'bg-emerald-100 text-emerald-950 ring-2 ring-[#6558E8]' : 'bg-emerald-50 text-emerald-950 font-medium';
                symbol = '+';
              } else if (diff.type === 'removed') {
                rowBg = isSelected ? 'bg-rose-100 text-rose-950 ring-2 ring-[#6558E8]' : 'bg-rose-50 text-rose-950';
                symbol = '-';
                text = diff.originalText || '';
              }

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isChange) setSelectedDiffIndex(globalIndex);
                  }}
                  className={`flex items-start px-4 py-1.5 ${rowBg} ${
                    isChange ? 'cursor-pointer hover:bg-opacity-80' : ''
                  }`}
                >
                  <span className="w-10 text-[#777D91] select-none text-[11px] tabular-nums text-right pr-2">
                    {lineNum ?? ''}
                  </span>
                  <span
                    className={`w-5 font-bold select-none ${
                      diff.type === 'added'
                        ? 'text-[#15966B]'
                        : diff.type === 'removed'
                        ? 'text-[#DF5966]'
                        : 'text-[#777D91]'
                    }`}
                  >
                    {symbol}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-words">{text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Annotation Inspector Drawer/Card */}
      {activeDiff && (
        <div className="bg-white rounded-2xl border border-[#6558E8]/30 shadow-md p-5 relative overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2">
          {/* Subtle top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6558E8]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F0EDFF] flex items-center justify-center text-[#6558E8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#171A2B] flex items-center gap-2">
                  <span>Smart Document Annotation</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getSeverityBadge(activeDiff.severity)}`}>
                    {activeDiff.severity || 'Important'}
                  </span>
                  {activeDiff.entityType && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-[#F8F9FC] text-[#6558E8] border border-[#E9EAF1] rounded-md font-semibold">
                      {activeDiff.entityType}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-[#777D91]">
                  Change #{currentChangeNumber} of {changedIndices.length} ({activeDiff.type})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrevChange}
                className="px-2.5 py-1 text-xs text-[#777D91] hover:text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] border border-[#E9EAF1] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNextChange}
                className="px-2.5 py-1 text-xs text-white bg-[#6558E8] hover:bg-[#5245db] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedDiffIndex(null)}
                className="p-1 text-[#777D91] hover:text-[#171A2B] hover:bg-[#F8F9FC] rounded-lg transition-colors cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Before & After Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-[#DF5966] mb-1">
                Original Value (Was)
              </div>
              <div className="text-xs font-mono text-rose-950 whitespace-pre-wrap break-words">
                {activeDiff.beforeValue || activeDiff.originalText || '(None / Added)'}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-[#15966B] mb-1">
                Updated Value (Now)
              </div>
              <div className="text-xs font-mono text-emerald-950 font-medium whitespace-pre-wrap break-words">
                {activeDiff.afterValue || activeDiff.updatedText || '(None / Removed)'}
              </div>
            </div>
          </div>

          {/* AI Explanation / Why It Matters */}
          {activeDiff.whyItMatters && (
            <div className="p-3 bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl text-xs text-[#171A2B] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#6558E8] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-[#171A2B]">Why this matters: </span>
                <FormattedText content={activeDiff.whyItMatters} className="inline text-[#777D91]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

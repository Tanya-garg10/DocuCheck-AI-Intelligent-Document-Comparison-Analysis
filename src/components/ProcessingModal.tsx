import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  GitCompare, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Cpu, 
  ArrowLeftRight 
} from 'lucide-react';

interface ProcessingModalProps {
  originalName: string;
  updatedName: string;
}

const STAGES = [
  { id: 1, title: 'Extracting document content', detail: 'Parsing text buffers and AST structures' },
  { id: 2, title: 'Comparing text and sections', detail: 'Computing line and block differences' },
  { id: 3, title: 'Detecting inconsistencies', detail: 'Auditing numeric variances and dropped clauses' },
  { id: 4, title: 'Generating AI insights', detail: 'Consulting BharatCode AI qwen-3.8-27b' },
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ originalName, updatedName }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(25);

  useEffect(() => {
    const t1 = setTimeout(() => { setCurrentStage(2); setProgressPercent(50); }, 600);
    const t2 = setTimeout(() => { setCurrentStage(3); setProgressPercent(75); }, 1300);
    const t3 = setTimeout(() => { setCurrentStage(4); setProgressPercent(90); }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden">
        {/* Animated Central Document Comparison Illustration */}
        <div className="flex items-center justify-center gap-4 my-4">
          {/* Doc 1 icon */}
          <div className="w-12 h-16 rounded-xl bg-[#F8F9FC] border border-[#E9EAF1] shadow-xs flex flex-col justify-between p-2 transform -rotate-3 transition-transform">
            <div className="w-4 h-1 bg-[#777D91]/40 rounded-full" />
            <div className="space-y-1">
              <div className="w-full h-1 bg-[#777D91]/30 rounded-full" />
              <div className="w-4/5 h-1 bg-[#777D91]/30 rounded-full" />
              <div className="w-2/3 h-1 bg-[#DF5966]/60 rounded-full" />
            </div>
          </div>

          {/* Animated Exchange Node */}
          <div className="w-10 h-10 rounded-full bg-[#F0EDFF] border border-[#6558E8]/20 flex items-center justify-center text-[#6558E8] shadow-xs">
            <ArrowLeftRight className="w-4 h-4 animate-pulse" />
          </div>

          {/* Doc 2 icon */}
          <div className="w-12 h-16 rounded-xl bg-white border border-[#E9EAF1] shadow-xs flex flex-col justify-between p-2 transform rotate-3 transition-transform">
            <div className="w-4 h-1 bg-[#6558E8]/50 rounded-full" />
            <div className="space-y-1">
              <div className="w-full h-1 bg-[#777D91]/30 rounded-full" />
              <div className="w-4/5 h-1 bg-[#15966B]/60 rounded-full" />
              <div className="w-3/4 h-1 bg-[#15966B]/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold text-[#171A2B]">Analyzing Differences</h3>
          <p className="text-xs text-[#777D91] mt-1 truncate max-w-full px-4">
            {originalName} vs {updatedName}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#F8F9FC] border border-[#E9EAF1] rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-[#6558E8] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Real Processing Stages */}
        <div className="space-y-3">
          {STAGES.map((stage) => {
            const isCompleted = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                  isCurrent ? 'bg-[#F0EDFF]/60 border border-[#6558E8]/20' : 'bg-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#6558E8] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#E9EAF1]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-[#171A2B]' : isCompleted ? 'text-[#171A2B]' : 'text-[#777D91]'}`}>
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-[#777D91] truncate">
                    {stage.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-[#E9EAF1] flex items-center justify-center gap-2 text-[11px] text-[#777D91]">
          <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
          <span>BharatCode AI (qwen-3.8-27b) active</span>
        </div>
      </div>
    </div>
  );
};

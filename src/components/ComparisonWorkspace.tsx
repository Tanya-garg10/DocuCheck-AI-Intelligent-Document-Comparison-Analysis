import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  GitCompare,
  ArrowLeftRight,
  FileCheck2,
  FileCode2,
  FolderOpen
} from 'lucide-react';

interface FileUploadState {
  file: File | null;
  text: string;
  isTextMode: boolean;
  name: string;
  size: number;
}

interface ComparisonWorkspaceProps {
  onCompare: (
    origFile: File | null,
    updFile: File | null,
    origText: string,
    updText: string,
    origName: string,
    updName: string
  ) => void;
  onRunDemo: (type: 'employment' | 'legal_nda') => void;
  isLoading: boolean;
}

export const ComparisonWorkspace: React.FC<ComparisonWorkspaceProps> = ({
  onCompare,
  onRunDemo,
  isLoading,
}) => {
  const [original, setOriginal] = useState<FileUploadState>({
    file: null,
    text: '',
    isTextMode: false,
    name: '',
    size: 0,
  });

  const [updated, setUpdated] = useState<FileUploadState>({
    file: null,
    text: '',
    isTextMode: false,
    name: '',
    size: 0,
  });

  const [origDragOver, setOrigDragOver] = useState(false);
  const [updDragOver, setUpdDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const origInputRef = useRef<HTMLInputElement>(null);
  const updInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const validateAndSetFile = (file: File, isOriginal: boolean) => {
    setErrorMessage(null);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validExtensions = ['.pdf', '.docx', '.txt', '.md', '.rtf'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      setErrorMessage(`File "${file.name}" exceeds 10 MB limit (${formatFileSize(file.size)}).`);
      return;
    }

    if (!validExtensions.includes(ext) && !file.type.includes('text') && !file.type.includes('pdf')) {
      setErrorMessage(`File "${file.name}" is not a supported format. Please upload PDF, DOCX, or TXT.`);
      return;
    }

    const stateUpdate: FileUploadState = {
      file,
      text: '',
      isTextMode: false,
      name: file.name,
      size: file.size,
    };

    if (isOriginal) {
      setOriginal(stateUpdate);
    } else {
      setUpdated(stateUpdate);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isOriginal: boolean) => {
    e.preventDefault();
    if (isOriginal) setOrigDragOver(false);
    else setUpdDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], isOriginal);
    }
  };

  const handleRemove = (isOriginal: boolean) => {
    if (isOriginal) {
      setOriginal({ file: null, text: '', isTextMode: false, name: '', size: 0 });
      if (origInputRef.current) origInputRef.current.value = '';
    } else {
      setUpdated({ file: null, text: '', isTextMode: false, name: '', size: 0 });
      if (updInputRef.current) updInputRef.current.value = '';
    }
  };

  const isOriginalReady = original.file !== null || (original.isTextMode && original.text.trim().length > 0);
  const isUpdatedReady = updated.file !== null || (updated.isTextMode && updated.text.trim().length > 0);
  const canCompare = isOriginalReady && isUpdatedReady && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCompare) return;

    onCompare(
      original.file,
      updated.file,
      original.text,
      updated.text,
      original.name || 'Original Document',
      updated.name || 'Updated Document'
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Workspace Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A2B]">
          Document Comparison
        </h1>
        <p className="mt-1 text-sm text-[#777D91]">
          Upload both versions of your document to reveal syntactic differences and AI insights.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-[#DF5966]">
            <AlertCircle className="w-4 h-4 text-[#DF5966] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Two-Column Upload Area with Center Symbol */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Centered Comparison Symbol (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#E9EAF1] shadow-md items-center justify-center text-[#6558E8]">
            <ArrowLeftRight className="w-5 h-5" />
          </div>

          {/* LEFT: ORIGINAL DOCUMENT */}
          <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6 flex flex-col transition-all hover:border-[#6558E8]/20">
            {/* Header Strip */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EAF1] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#F8F9FC] text-[#171A2B] border border-[#E9EAF1] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-[#171A2B]">Original Document</h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-0.5 bg-[#F8F9FC] rounded-lg border border-[#E9EAF1] text-[11px]">
                <button
                  type="button"
                  onClick={() => setOriginal(prev => ({ ...prev, isTextMode: false }))}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    !original.isTextMode ? 'bg-white font-semibold text-[#171A2B] shadow-2xs' : 'text-[#777D91] hover:text-[#171A2B]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setOriginal(prev => ({ ...prev, isTextMode: true, name: prev.name || 'Original_Snippet.txt' }))}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    original.isTextMode ? 'bg-white font-semibold text-[#171A2B] shadow-2xs' : 'text-[#777D91] hover:text-[#171A2B]'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* Upload Body */}
            {!original.isTextMode ? (
              original.file ? (
                /* Selected File State */
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1] text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15966B] flex items-center justify-center mb-3">
                    <FileCheck2 className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15966B] bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Upload Ready</span>
                  </span>
                  <div className="font-bold text-sm text-[#171A2B] truncate max-w-full px-4">
                    {original.file.name}
                  </div>
                  <div className="text-xs text-[#777D91] mt-1 font-mono tabular-nums">
                    {formatFileSize(original.file.size)} · PDF/DOCX validated
                  </div>

                  <div className="mt-5 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => origInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171A2B] bg-white border border-[#E9EAF1] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#777D91]" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#DF5966] bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone State */
                <div
                  onDragOver={(e) => { e.preventDefault(); setOrigDragOver(true); }}
                  onDragLeave={() => setOrigDragOver(false)}
                  onDrop={(e) => handleDrop(e, true)}
                  onClick={() => origInputRef.current?.click()}
                  className={`flex-1 min-h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
                    origDragOver 
                      ? 'border-[#6558E8] bg-[#F0EDFF]/30' 
                      : 'border-[#E9EAF1] hover:border-[#6558E8]/50 bg-[#F8F9FC]/60 hover:bg-[#F8F9FC]'
                  }`}
                >
                  <input
                    type="file"
                    ref={origInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        validateAndSetFile(e.target.files[0], true);
                      }
                    }}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E9EAF1] flex items-center justify-center text-[#6558E8] mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#171A2B]">
                    Drag and drop original document
                  </p>
                  <p className="text-xs text-[#777D91] mt-1">
                    PDF, DOCX, or TXT (Max 10 MB)
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#171A2B] bg-white border border-[#E9EAF1] rounded-lg shadow-2xs">
                    <FolderOpen className="w-3.5 h-3.5 text-[#777D91]" />
                    <span>Browse files</span>
                  </span>
                </div>
              )
            ) : (
              /* Text Paste Mode */
              <div className="flex-1 flex flex-col">
                <textarea
                  value={original.text}
                  onChange={(e) => setOriginal(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Paste the raw text of the original document here..."
                  className="w-full flex-1 min-h-[240px] p-3.5 text-xs font-mono text-[#171A2B] bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6558E8] resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-[#777D91] font-mono tabular-nums">
                  <span>{original.text.length} characters</span>
                  <span>{original.text.trim() ? original.text.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: UPDATED DOCUMENT */}
          <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-6 flex flex-col transition-all hover:border-[#6558E8]/20">
            {/* Header Strip */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EAF1] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#F0EDFF] text-[#6558E8] border border-[#6558E8]/20 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-sm font-bold text-[#171A2B]">Updated Document</h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-0.5 bg-[#F8F9FC] rounded-lg border border-[#E9EAF1] text-[11px]">
                <button
                  type="button"
                  onClick={() => setUpdated(prev => ({ ...prev, isTextMode: false }))}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    !updated.isTextMode ? 'bg-white font-semibold text-[#171A2B] shadow-2xs' : 'text-[#777D91] hover:text-[#171A2B]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUpdated(prev => ({ ...prev, isTextMode: true, name: prev.name || 'Updated_Snippet.txt' }))}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    updated.isTextMode ? 'bg-white font-semibold text-[#171A2B] shadow-2xs' : 'text-[#777D91] hover:text-[#171A2B]'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* Upload Body */}
            {!updated.isTextMode ? (
              updated.file ? (
                /* Selected File State */
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1] text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15966B] flex items-center justify-center mb-3">
                    <FileCheck2 className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15966B] bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Upload Ready</span>
                  </span>
                  <div className="font-bold text-sm text-[#171A2B] truncate max-w-full px-4">
                    {updated.file.name}
                  </div>
                  <div className="text-xs text-[#777D91] mt-1 font-mono tabular-nums">
                    {formatFileSize(updated.file.size)} · PDF/DOCX validated
                  </div>

                  <div className="mt-5 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => updInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171A2B] bg-white border border-[#E9EAF1] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#777D91]" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#DF5966] bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone State */
                <div
                  onDragOver={(e) => { e.preventDefault(); setUpdDragOver(true); }}
                  onDragLeave={() => setUpdDragOver(false)}
                  onDrop={(e) => handleDrop(e, false)}
                  onClick={() => updInputRef.current?.click()}
                  className={`flex-1 min-h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
                    updDragOver 
                      ? 'border-[#6558E8] bg-[#F0EDFF]/30' 
                      : 'border-[#E9EAF1] hover:border-[#6558E8]/50 bg-[#F8F9FC]/60 hover:bg-[#F8F9FC]'
                  }`}
                >
                  <input
                    type="file"
                    ref={updInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        validateAndSetFile(e.target.files[0], false);
                      }
                    }}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E9EAF1] flex items-center justify-center text-[#6558E8] mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#171A2B]">
                    Drag and drop updated document
                  </p>
                  <p className="text-xs text-[#777D91] mt-1">
                    PDF, DOCX, or TXT (Max 10 MB)
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#171A2B] bg-white border border-[#E9EAF1] rounded-lg shadow-2xs">
                    <FolderOpen className="w-3.5 h-3.5 text-[#777D91]" />
                    <span>Browse files</span>
                  </span>
                </div>
              )
            ) : (
              /* Text Paste Mode */
              <div className="flex-1 flex flex-col">
                <textarea
                  value={updated.text}
                  onChange={(e) => setUpdated(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Paste the raw text of the updated document here..."
                  className="w-full flex-1 min-h-[240px] p-3.5 text-xs font-mono text-[#171A2B] bg-[#F8F9FC] border border-[#E9EAF1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6558E8] resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-[#777D91] font-mono tabular-nums">
                  <span>{updated.text.length} characters</span>
                  <span>{updated.text.trim() ? updated.text.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Trigger & Sample Demo Bar */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-[#E9EAF1] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className={`w-4 h-4 ${isOriginalReady && isUpdatedReady ? 'text-[#15966B]' : 'text-[#777D91]'}`} />
              <span className="font-medium text-[#171A2B]">
                {isOriginalReady && isUpdatedReady
                  ? 'Both documents verified and ready.'
                  : 'Select or paste both documents to proceed.'}
              </span>
            </div>

            <span className="hidden sm:inline text-[#E9EAF1]">|</span>

            {/* Quick Demo Shortcuts */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#777D91]">Instant test:</span>
              <button
                type="button"
                onClick={() => onRunDemo('employment')}
                className="text-[11px] font-semibold text-[#6558E8] hover:underline cursor-pointer"
              >
                Offer Letter
              </button>
              <span className="text-[#777D91]">·</span>
              <button
                type="button"
                onClick={() => onRunDemo('legal_nda')}
                className="text-[11px] font-semibold text-[#6558E8] hover:underline cursor-pointer"
              >
                Legal NDA
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canCompare}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap ${
              canCompare
                ? 'text-white bg-[#6558E8] hover:bg-[#5245db] active:bg-[#4638cb] shadow-[#6558E8]/20'
                : 'text-[#777D91] bg-[#F8F9FC] border border-[#E9EAF1] cursor-not-allowed'
            }`}
          >
            <span>Compare documents →</span>
          </button>
        </div>
      </form>
    </div>
  );
};

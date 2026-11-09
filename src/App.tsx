import React, { useState, useEffect } from 'react';
import { AppView, ComparisonRecord } from './types/comparison';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ComparisonWorkspace } from './components/ComparisonWorkspace';
import { ComparisonResults } from './components/ComparisonResults';
import { ComparisonHistory } from './components/ComparisonHistory';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { ProcessingModal } from './components/ProcessingModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { 
  getStoredComparisons, 
  saveComparison, 
  deleteComparison, 
  clearComparisonHistory 
} from './utils/storage';
import { 
  Menu, 
  Plus, 
  Sparkles, 
  AlertCircle,
  User
} from 'lucide-react';

export default function App() {
  // Start directly in the application workspace
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<ComparisonRecord | null>(null);
  const [history, setHistory] = useState<ComparisonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [processingNames, setProcessingNames] = useState({
    original: 'Original Document',
    updated: 'Updated Document',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load history on mount
  useEffect(() => {
    const stored = getStoredComparisons();
    setHistory(stored);
  }, []);

  // Handle Document Comparison Request
  const handleCompare = async (
    origFile: File | null,
    updFile: File | null,
    origText: string,
    updText: string,
    origName: string,
    updName: string
  ) => {
    setErrorMessage(null);
    setIsLoading(true);
    setProcessingNames({ original: origName, updated: updName });

    try {
      let res: Response;

      if (origFile && updFile) {
        // Multipart upload
        const formData = new FormData();
        formData.append('originalFile', origFile);
        formData.append('updatedFile', updFile);

        res = await fetch('/api/compare', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text payload
        res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: origText,
            updatedText: updText,
            originalDocumentName: origName,
            updatedDocumentName: updName,
          }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error status ${res.status}`);
      }

      const comparisonRecord: ComparisonRecord = await res.json();

      saveComparison(comparisonRecord);
      setHistory(getStoredComparisons());
      setCurrentRecord(comparisonRecord);
      setCurrentView('results');
      showToast('Document comparison completed successfully.');
    } catch (err: any) {
      console.error('Comparison error:', err);
      setErrorMessage(err.message || 'An error occurred while processing the comparison.');
      showToast(err.message || 'Comparison failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Instant Sample Demo
  const handleRunDemo = async (type: 'employment' | 'legal_nda') => {
    setErrorMessage(null);
    setIsLoading(true);
    const demoLabelOrig = type === 'legal_nda' ? 'Acronis_NDA_v1.0.docx' : 'Employment_Offer_Rahul_Sharma_Original.pdf';
    const demoLabelUpd = type === 'legal_nda' ? 'Acronis_NDA_v2.0.docx' : 'Employment_Offer_Rahul_Sharma_Revision.pdf';
    setProcessingNames({ original: demoLabelOrig, updated: demoLabelUpd });

    try {
      const res = await fetch('/api/demo-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoType: type }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to run sample demo (${res.status})`);
      }

      const comparisonRecord: ComparisonRecord = await res.json();
      saveComparison(comparisonRecord);
      setHistory(getStoredComparisons());
      setCurrentRecord(comparisonRecord);
      setCurrentView('results');
      showToast(`Loaded "${type === 'legal_nda' ? 'Legal NDA' : 'Offer Letter'}" scenario demo.`);
    } catch (err: any) {
      console.error('Demo comparison error:', err);
      setErrorMessage(err.message || 'An error occurred generating sample demo.');
      showToast('Demo generation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = deleteComparison(id);
    setHistory(updated);
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
      setCurrentView('history');
    }
  };

  const handleClearHistory = () => {
    clearComparisonHistory();
    setHistory([]);
    setCurrentRecord(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setErrorMessage(null);
          setCurrentView(view);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        analyzedCount={history.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E9EAF1] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#777D91] hover:text-[#171A2B] rounded-lg hover:bg-[#F8F9FC]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#777D91]">
              <span 
                onClick={() => setCurrentView('dashboard')}
                className="hover:text-[#171A2B] cursor-pointer"
              >
                Workspace
              </span>
              <span>/</span>
              <span className="font-semibold text-[#171A2B] capitalize">
                {currentView === 'new-comparison' 
                  ? 'New Comparison' 
                  : currentView === 'results' 
                  ? 'Results' 
                  : currentView}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleRunDemo('employment')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] hover:text-[#6558E8] border border-[#E9EAF1] rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6558E8]" />
              <span>Sample Demo</span>
            </button>

            {currentView !== 'new-comparison' && (
              <button
                onClick={() => setCurrentView('new-comparison')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6558E8] hover:bg-[#5245db] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New comparison</span>
              </button>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => setCurrentView('profile')}
              title="View profile & analyzed documents"
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-[#6558E8] text-white shadow-xs'
                  : 'bg-[#F0EDFF] text-[#6558E8] hover:bg-[#e4deff]'
              }`}
            >
              TG
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4 w-full">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-[#DF5966]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Router Main View */}
        <main className="flex-1 pb-16">
          {currentView === 'dashboard' && (
            <DashboardOverview
              history={history}
              onNewComparison={() => setCurrentView('new-comparison')}
              onSelectRecord={(rec) => {
                setCurrentRecord(rec);
                setCurrentView('results');
              }}
              onRunDemo={handleRunDemo}
            />
          )}

          {currentView === 'new-comparison' && (
            <ComparisonWorkspace
              onCompare={handleCompare}
              onRunDemo={handleRunDemo}
              isLoading={isLoading}
            />
          )}

          {currentView === 'results' && currentRecord && (
            <ComparisonResults
              record={currentRecord}
              onNewComparison={() => setCurrentView('new-comparison')}
              onShowToast={showToast}
            />
          )}

          {currentView === 'history' && (
            <ComparisonHistory
              history={history}
              onSelectRecord={(rec) => {
                setCurrentRecord(rec);
                setCurrentView('results');
              }}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearHistory}
              onStartNew={() => setCurrentView('new-comparison')}
              onShowToast={showToast}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              history={history}
              onNewComparison={() => setCurrentView('new-comparison')}
              onSelectRecord={(rec) => {
                setCurrentRecord(rec);
                setCurrentView('results');
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Global Loading Overlay */}
      {isLoading && (
        <ProcessingModal
          originalName={processingNames.original}
          updatedName={processingNames.updated}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

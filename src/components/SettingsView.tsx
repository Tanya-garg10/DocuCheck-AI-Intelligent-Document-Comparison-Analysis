import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key,
  ShieldCheck
} from 'lucide-react';

interface HealthData {
  status: string;
  bharatCodeConfigured: boolean;
  model: string;
  endpoint: string;
  timestamp: string;
}

interface SettingsViewProps {
  onShowToast?: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
      const data = await res.json();
      setHealth(data);
      if (onShowToast) onShowToast('Diagnostics refreshed.');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A2B]">
          Settings & Status
        </h1>
        <p className="mt-1 text-sm text-[#777D91]">
          Engine diagnostics and configuration.
        </p>
      </div>

      <div className="space-y-5">
        {/* Diagnostics Card */}
        <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E9EAF1]">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#6558E8]" />
              <h2 className="text-sm font-bold text-[#171A2B]">Engine Status</h2>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171A2B] bg-[#F8F9FC] hover:bg-[#F0EDFF] hover:text-[#6558E8] rounded-xl border border-[#E9EAF1] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[#DF5966] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1]">
                <span className="text-[10px] font-semibold text-[#777D91] uppercase tracking-wider block">Server</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                  <span className="text-xs font-semibold text-[#171A2B]">Online (Port 3000)</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1]">
                <span className="text-[10px] font-semibold text-[#777D91] uppercase tracking-wider block">BharatCode Key</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {health.bharatCodeConfigured ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                      <span className="text-xs font-semibold text-[#15966B]">Configured</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#D99A35]" />
                      <span className="text-xs font-semibold text-[#D99A35]">Local Heuristic Active</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1]">
                <span className="text-[10px] font-semibold text-[#777D91] uppercase tracking-wider block">Model</span>
                <span className="text-xs font-mono font-semibold text-[#6558E8] mt-1 block">
                  {health.model}
                </span>
              </div>

              <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E9EAF1]">
                <span className="text-[10px] font-semibold text-[#777D91] uppercase tracking-wider block">Endpoint</span>
                <span className="text-xs font-mono text-[#171A2B] mt-1 block truncate">
                  {health.endpoint}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#777D91]">Checking status...</div>
          )}
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-[#6558E8]" />
            <h2 className="text-sm font-bold text-[#171A2B]">Environment Configuration</h2>
          </div>

          <p className="text-xs text-[#777D91] leading-relaxed mb-3">
            To connect with cloud LLM inference, set your key in <code className="font-mono text-[#171A2B]">.env</code>:
          </p>

          <div className="p-3.5 bg-[#171A2B] rounded-xl font-mono text-xs text-slate-100 overflow-x-auto">
            <span className="text-[#15966B]">BHARATCODE_API_KEY</span>="your_api_key_here"
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#777D91]">
            <ShieldCheck className="w-4 h-4 text-[#15966B] shrink-0" />
            <span>Files are processed strictly in volatile RAM. No documents are stored on server disk.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

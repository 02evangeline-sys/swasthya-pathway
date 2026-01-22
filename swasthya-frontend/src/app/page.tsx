'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import HealthChart from '@/components/HealthChart';
import AnalysisPanel from '@/components/AnalysisPanel';
import HistoryTable from '@/components/HistoryTable';
import { Search, Radio, Wifi, WifiOff } from 'lucide-react';

export default function HomePage() {
  const [cowIdInput, setCowIdInput] = useState('');
  const [activeCowId, setActiveCowId] = useState<string | null>(null);

  const {
    isConnected,
    isMonitoring,
    currentData,
    dataHistory,
    alerts,
    startMonitoring,
    stopMonitoring,
  } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cowIdInput.trim()) {
      setActiveCowId(cowIdInput.trim());
      startMonitoring(cowIdInput.trim());
    }
  };

  const handleStop = () => {
    stopMonitoring();
    setActiveCowId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Intelligence Hub</h1>
          <p className="text-[var(--text-secondary)]">
            Real-time bovine health monitoring and analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-[rgba(0,212,170,0.15)]' : 'bg-[rgba(255,59,92,0.15)]'
              }`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4 text-[#00d4aa]" />
            ) : (
              <WifiOff className="w-4 h-4 text-[#ff3b5c]" />
            )}
            <span
              className={`text-sm ${isConnected ? 'text-[#00d4aa]' : 'text-[#ff3b5c]'
                }`}
            >
              {isConnected ? 'Server Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Cow ID Input */}
      <form onSubmit={handleSubmit} className="glass-panel p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={cowIdInput}
            onChange={(e) => setCowIdInput(e.target.value)}
            placeholder="Enter Cow ID (e.g., COW-001)"
            className="input-field pl-12"
          />
        </div>
        {isMonitoring ? (
          <button type="button" onClick={handleStop} className="btn-secondary">
            Stop Monitoring
          </button>
        ) : (
          <button
            type="submit"
            disabled={!isConnected || !cowIdInput.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Radio className="w-4 h-4" />
            Start Monitoring
          </button>
        )}
      </form>

      {/* Main Grid - 60% Charts / 40% Analysis */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Column - Charts */}
        <div className="col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[220px]">
              <HealthChart data={dataHistory} type="weight" />
            </div>
            <div className="h-[220px]">
              <HealthChart data={dataHistory} type="temperature" />
            </div>
            <div className="h-[220px]">
              <HealthChart data={dataHistory} type="gait" />
            </div>
            <div className="h-[220px]">
              <HealthChart data={dataHistory} type="activity" />
            </div>
          </div>
        </div>

        {/* Right Column - Analysis Panel */}
        <div className="col-span-2">
          <AnalysisPanel
            data={currentData}
            alerts={alerts}
            isConnected={isConnected}
            isMonitoring={isMonitoring}
          />
        </div>
      </div>

      {/* Bottom Section - History Table */}
      <HistoryTable cowId={activeCowId} currentData={dataHistory} />
    </div>
  );
}

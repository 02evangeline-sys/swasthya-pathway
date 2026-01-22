'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import HealthChart from '@/components/HealthChart';
import { Search, Radio } from 'lucide-react';

export default function ChartsPage() {
    const [cowIdInput, setCowIdInput] = useState('');
    const [activeCowId, setActiveCowId] = useState<string | null>(null);

    const {
        isConnected,
        isMonitoring,
        dataHistory,
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

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Real-Time Charts</h1>
                    <p className="text-[var(--text-secondary)]">
                        Auto-refresh graphs updated every 3 seconds
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-[#00d4aa] animate-pulse' : 'bg-[var(--text-secondary)]'
                            }`}
                    ></div>
                    <span className="text-sm text-[var(--text-secondary)]">
                        {isMonitoring ? `Live: ${activeCowId}` : 'Not monitoring'}
                    </span>
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
                        placeholder="Enter Cow ID to view charts"
                        className="input-field pl-12"
                    />
                </div>
                {isMonitoring ? (
                    <button type="button" onClick={stopMonitoring} className="btn-secondary">
                        Stop
                    </button>
                ) : (
                    <button type="submit" disabled={!isConnected} className="btn-primary flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        Start Live Feed
                    </button>
                )}
            </form>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="h-[300px]">
                    <HealthChart data={dataHistory} type="weight" />
                </div>
                <div className="h-[300px]">
                    <HealthChart data={dataHistory} type="temperature" />
                </div>
                <div className="h-[300px]">
                    <HealthChart data={dataHistory} type="gait" />
                </div>
                <div className="h-[300px]">
                    <HealthChart data={dataHistory} type="activity" />
                </div>
            </div>

            {/* Chart Legend */}
            <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold mb-3">Chart Legend</h3>
                <div className="grid grid-cols-4 gap-4">
                    <LegendItem color="#00d4aa" label="Weight (lbs)" />
                    <LegendItem color="#ff9500" label="Temperature (°F)" threshold="> 103°F" />
                    <LegendItem color="#0099ff" label="Gait Score (1-5)" threshold="≥ 3" />
                    <LegendItem color="#a855f7" label="Activity Level (%)" threshold="< 20%" />
                </div>
            </div>
        </div>
    );
}

function LegendItem({
    color,
    label,
    threshold,
}: {
    color: string;
    label: string;
    threshold?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
            ></div>
            <div>
                <p className="text-sm">{label}</p>
                {threshold && (
                    <p className="text-xs text-[#ff3b5c]">Abnormal: {threshold}</p>
                )}
            </div>
        </div>
    );
}

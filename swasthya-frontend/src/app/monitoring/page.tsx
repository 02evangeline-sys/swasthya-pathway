'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
    Activity,
    Thermometer,
    Weight,
    Footprints,
    Camera,
    Bell,
    Search,
    RefreshCw,
} from 'lucide-react';

export default function MonitoringPage() {
    const [cowIdInput, setCowIdInput] = useState('');
    const [activeCowId, setActiveCowId] = useState<string | null>(null);

    const {
        isConnected,
        isMonitoring,
        currentData,
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

    const isAbnormal = currentData?.status === 'Abnormal';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Live Monitoring Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">
                        Real-time sensor data when cow enters the pathway
                    </p>
                </div>
                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${isMonitoring
                            ? 'bg-[rgba(0,212,170,0.15)]'
                            : 'bg-[var(--bg-tertiary)]'
                        }`}
                >
                    <div
                        className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-[#00d4aa] animate-pulse' : 'bg-[var(--text-secondary)]'
                            }`}
                    ></div>
                    <span className="text-sm">
                        {isMonitoring ? 'Live Monitoring Active' : 'Standby'}
                    </span>
                </div>
            </div>

            {/* Cow ID Search */}
            <form onSubmit={handleSubmit} className="glass-panel p-4 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={cowIdInput}
                        onChange={(e) => setCowIdInput(e.target.value)}
                        placeholder="Enter Cow Tag Number"
                        className="input-field pl-12"
                    />
                </div>
                {isMonitoring ? (
                    <button type="button" onClick={stopMonitoring} className="btn-secondary">
                        Stop
                    </button>
                ) : (
                    <button type="submit" disabled={!isConnected} className="btn-primary">
                        Start Monitoring
                    </button>
                )}
            </form>

            {/* Main Content */}
            {currentData ? (
                <div className="space-y-6">
                    {/* Status Banner */}
                    <div
                        className={`p-6 rounded-xl ${isAbnormal ? 'abnormal-panel' : 'glass-panel'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center ${isAbnormal
                                            ? 'bg-[rgba(255,59,92,0.2)]'
                                            : 'bg-[rgba(0,212,170,0.2)]'
                                        }`}
                                >
                                    <span className="text-2xl font-bold">
                                        {currentData.cowId.slice(-2)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Cow {currentData.cowId}</h2>
                                    <p className="text-[var(--text-secondary)]">
                                        Last updated: {new Date(currentData.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={isAbnormal ? 'badge-abnormal' : 'badge-normal'}>
                                    {currentData.status}
                                </span>
                                {isAbnormal && (
                                    <button className="btn-secondary flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        View Alerts
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sensor Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <SensorCard
                            icon={Weight}
                            title="Weight"
                            value={`${currentData.sensors.weight} lbs`}
                            subValue={`Imbalance: ${currentData.sensors.loadImbalance}%`}
                            isWarning={currentData.sensors.loadImbalance > 15}
                        />
                        <SensorCard
                            icon={Thermometer}
                            title="Temperature"
                            value={`${currentData.sensors.temperature}°F`}
                            subValue="Udder Surface"
                            isWarning={currentData.sensors.temperature > 103}
                        />
                        <SensorCard
                            icon={Footprints}
                            title="Gait Score"
                            value={`${currentData.sensors.gaitScore}/5`}
                            subValue={currentData.sensors.gaitScore >= 3 ? 'Limping Detected' : 'Normal Stride'}
                            isWarning={currentData.sensors.gaitScore >= 3}
                        />
                        <SensorCard
                            icon={Activity}
                            title="Activity Level"
                            value={`${currentData.sensors.activityLevel}%`}
                            subValue="Movement Rate"
                            isWarning={currentData.sensors.activityLevel < 20}
                        />
                    </div>

                    {/* Analysis Trigger */}
                    {isAbnormal && (
                        <div className="glass-panel p-6 animate-fadeIn border border-[#ff3b5c]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[rgba(255,59,92,0.2)] flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-[#ff3b5c] animate-spin" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#ff3b5c]">
                                        Disease Analysis Triggered
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Abnormal readings detected. Running AI diagnostics...
                                    </p>
                                </div>
                                <a href="/analysis" className="btn-primary">
                                    View Analysis
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <Camera className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Waiting for Cow Entry</h3>
                    <p className="text-[var(--text-secondary)]">
                        Enter a cow ID above or wait for automatic detection when a cow walks through the pathway
                    </p>
                </div>
            )}
        </div>
    );
}

interface SensorCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string;
    subValue: string;
    isWarning?: boolean;
}

function SensorCard({ icon: Icon, title, value, subValue, isWarning }: SensorCardProps) {
    return (
        <div
            className={`glass-panel p-5 ${isWarning ? 'border border-[#ff3b5c] animate-pulse' : ''
                }`}
        >
            <div className="flex items-center gap-3 mb-3">
                <Icon
                    className={`w-5 h-5 ${isWarning ? 'text-[#ff3b5c]' : 'text-[var(--accent-primary)]'
                        }`}
                />
                <span className="text-sm text-[var(--text-secondary)]">{title}</span>
            </div>
            <p
                className={`text-2xl font-bold ${isWarning ? 'text-[#ff3b5c]' : ''}`}
            >
                {value}
            </p>
            <p
                className={`text-xs mt-1 ${isWarning ? 'text-[#ff3b5c]' : 'text-[var(--text-secondary)]'
                    }`}
            >
                {subValue}
            </p>
        </div>
    );
}

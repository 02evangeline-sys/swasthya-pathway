'use client';

import { TelemetryData, AlertData } from '@/hooks/useSocket';
import {
    AlertTriangle,
    Camera,
    Activity,
    Thermometer,
    Weight,
    Footprints,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface AnalysisPanelProps {
    data: TelemetryData | null;
    alerts: AlertData[];
    isConnected: boolean;
    isMonitoring: boolean;
}

export default function AnalysisPanel({
    data,
    alerts,
    isConnected,
    isMonitoring,
}: AnalysisPanelProps) {
    const isAbnormal = data?.status === 'Abnormal';

    return (
        <div
            className={`h-full flex flex-col gap-4 p-4 rounded-xl ${isAbnormal ? 'abnormal-panel' : 'glass-panel'
                }`}
        >
            {/* Status Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Analysis Panel</h2>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00d4aa]' : 'bg-[#ff3b5c]'
                            } ${isMonitoring ? 'animate-pulse' : ''}`}
                    ></div>
                    <span className="text-xs text-[var(--text-secondary)]">
                        {isConnected ? (isMonitoring ? 'Live' : 'Connected') : 'Disconnected'}
                    </span>
                </div>
            </div>

            {!data ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-[var(--text-secondary)] text-center">
                        Enter a Cow ID to start monitoring
                    </p>
                </div>
            ) : (
                <>
                    {/* Cow Info */}
                    <div className="glass-panel-dark p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--text-secondary)]">Cow ID</span>
                            <span className={isAbnormal ? 'badge-abnormal' : 'badge-normal'}>
                                {data.status}
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{data.cowId}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Last update: {new Date(data.timestamp).toLocaleTimeString()}
                        </p>
                    </div>

                    {/* Current Readings */}
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard
                            icon={Weight}
                            label="Weight"
                            value={`${data.sensors.weight} lbs`}
                            isWarning={data.sensors.loadImbalance > 15}
                        />
                        <MetricCard
                            icon={Thermometer}
                            label="Temperature"
                            value={`${data.sensors.temperature}°F`}
                            isWarning={data.sensors.temperature > 103}
                        />
                        <MetricCard
                            icon={Footprints}
                            label="Gait Score"
                            value={`${data.sensors.gaitScore}/5`}
                            isWarning={data.sensors.gaitScore >= 3}
                        />
                        <MetricCard
                            icon={Activity}
                            label="Activity"
                            value={`${data.sensors.activityLevel}%`}
                            isWarning={data.sensors.activityLevel < 20}
                        />
                    </div>

                    {/* Camera Feed - Only show if abnormal */}
                    {isAbnormal && (
                        <div className="animate-fadeIn">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Camera Feed
                            </h3>
                            <div className="camera-feed">
                                <div className="text-center">
                                    <Camera className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Capturing abnormality...
                                    </p>
                                </div>
                                <div className="absolute top-2 left-2 flex items-center gap-2 bg-[#ff3b5c] px-2 py-1 rounded text-xs">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                    REC
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Diagnostics */}
                    {isAbnormal && data.analysis && (
                        <div
                            className="p-4 rounded-lg animate-fadeIn"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 59, 92, 0.15), rgba(26, 35, 50, 0.95))',
                                border: '1px solid rgba(255, 59, 92, 0.3)',
                            }}
                        >
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#ff3b5c]">
                                <AlertTriangle className="w-4 h-4" />
                                AI Diagnostics
                            </h3>

                            {/* Symptoms */}
                            {data.analysis.symptoms.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                                        Detected Symptoms:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.analysis.symptoms.map((symptom, i) => (
                                            <span
                                                key={i}
                                                className={`text-xs px-2 py-1 rounded ${symptom.severity === 'high'
                                                        ? 'risk-high'
                                                        : symptom.severity === 'medium'
                                                            ? 'risk-medium'
                                                            : 'risk-low'
                                                    }`}
                                            >
                                                {symptom.type}: {symptom.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Possible Diseases */}
                            {data.analysis.possibleDiseases.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                                        Possible Conditions:
                                    </p>
                                    {data.analysis.possibleDiseases.slice(0, 2).map((disease, i) => (
                                        <div key={i} className="flex items-center justify-between mb-1">
                                            <span className="text-sm">{disease.name}</span>
                                            <span
                                                className={`text-xs px-2 py-1 rounded ${disease.riskLevel === 'High'
                                                        ? 'risk-high'
                                                        : disease.riskLevel === 'Medium'
                                                            ? 'risk-medium'
                                                            : 'risk-low'
                                                    }`}
                                            >
                                                {disease.riskLevel} ({disease.confidence}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendations */}
                            {data.analysis.recommendations.length > 0 && (
                                <div className="border-t border-[var(--border-color)] pt-3">
                                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                                        Recommended Actions:
                                    </p>
                                    <ul className="space-y-1">
                                        {data.analysis.recommendations.slice(0, 2).map((rec, i) => (
                                            <li key={i} className="text-xs flex items-start gap-2">
                                                <span
                                                    className={`mt-0.5 w-1.5 h-1.5 rounded-full ${rec.priority === 'urgent'
                                                            ? 'bg-[#ff3b5c]'
                                                            : rec.priority === 'high'
                                                                ? 'bg-[#ff9500]'
                                                                : 'bg-[#00d4aa]'
                                                        }`}
                                                ></span>
                                                {rec.action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Normal Status */}
                    {!isAbnormal && (
                        <div className="flex-1 flex items-center justify-center glass-panel-dark rounded-lg p-4">
                            <div className="text-center">
                                <CheckCircle className="w-12 h-12 text-[#00d4aa] mx-auto mb-3" />
                                <p className="text-[#00d4aa] font-semibold">All Parameters Normal</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Cow is healthy. Continuing monitoring...
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

interface MetricCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    isWarning?: boolean;
}

function MetricCard({ icon: Icon, label, value, isWarning }: MetricCardProps) {
    return (
        <div
            className={`glass-panel-dark p-3 rounded-lg ${isWarning ? 'border-[#ff3b5c] border' : ''
                }`}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon
                    className={`w-4 h-4 ${isWarning ? 'text-[#ff3b5c]' : 'text-[var(--text-secondary)]'
                        }`}
                />
                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </div>
            <p
                className={`text-lg font-bold ${isWarning ? 'text-[#ff3b5c]' : 'text-white'
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

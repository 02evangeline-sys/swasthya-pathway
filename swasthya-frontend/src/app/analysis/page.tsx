'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
    AlertTriangle,
    Camera,
    CheckCircle,
    Activity,
    Search,
    Stethoscope,
} from 'lucide-react';

export default function AnalysisPage() {
    const [cowIdInput, setCowIdInput] = useState('');

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
            startMonitoring(cowIdInput.trim());
        }
    };

    const isAbnormal = currentData?.status === 'Abnormal';
    const analysis = currentData?.analysis;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-1">Health Analysis Panel</h1>
                <p className="text-[var(--text-secondary)]">
                    Automatic AI-powered analysis based on live sensor data
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSubmit} className="glass-panel p-4 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={cowIdInput}
                        onChange={(e) => setCowIdInput(e.target.value)}
                        placeholder="Enter Cow ID for analysis"
                        className="input-field pl-12"
                    />
                </div>
                {isMonitoring ? (
                    <button type="button" onClick={stopMonitoring} className="btn-secondary">
                        Stop
                    </button>
                ) : (
                    <button type="submit" disabled={!isConnected} className="btn-primary">
                        Analyze
                    </button>
                )}
            </form>

            {currentData && analysis ? (
                <div className="grid grid-cols-2 gap-6">
                    {/* Left - Detected Conditions */}
                    <div className="space-y-4">
                        {/* Status */}
                        <div
                            className={`p-6 rounded-xl ${isAbnormal ? 'abnormal-panel' : 'glass-panel'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {isAbnormal ? (
                                    <AlertTriangle className="w-12 h-12 text-[#ff3b5c]" />
                                ) : (
                                    <CheckCircle className="w-12 h-12 text-[#00d4aa]" />
                                )}
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {isAbnormal ? 'Abnormalities Detected' : 'All Systems Normal'}
                                    </h2>
                                    <p className="text-[var(--text-secondary)]">
                                        Cow ID: {currentData.cowId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detected Symptoms */}
                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Detected Conditions
                            </h3>
                            {analysis.symptoms.length > 0 ? (
                                <div className="space-y-3">
                                    {analysis.symptoms.map((symptom, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-lg border ${symptom.severity === 'high'
                                                    ? 'border-[#ff3b5c] bg-[rgba(255,59,92,0.1)]'
                                                    : symptom.severity === 'medium'
                                                        ? 'border-[#ff9500] bg-[rgba(255,149,0,0.1)]'
                                                        : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold capitalize">
                                                    {symptom.type.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${symptom.severity === 'high'
                                                            ? 'risk-high'
                                                            : symptom.severity === 'medium'
                                                                ? 'risk-medium'
                                                                : 'risk-low'
                                                        }`}
                                                >
                                                    {symptom.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                                Current value: {symptom.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[var(--text-secondary)] text-center py-4">
                                    No abnormal conditions detected
                                </p>
                            )}
                        </div>

                        {/* Recommendations */}
                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" />
                                Recommendations
                            </h3>
                            <div className="space-y-2">
                                {analysis.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-2 ${rec.priority === 'urgent'
                                                    ? 'bg-[#ff3b5c]'
                                                    : rec.priority === 'high'
                                                        ? 'bg-[#ff9500]'
                                                        : 'bg-[#00d4aa]'
                                                }`}
                                        ></div>
                                        <div>
                                            <span
                                                className={`text-xs uppercase ${rec.priority === 'urgent'
                                                        ? 'text-[#ff3b5c]'
                                                        : rec.priority === 'high'
                                                            ? 'text-[#ff9500]'
                                                            : 'text-[#00d4aa]'
                                                    }`}
                                            >
                                                {rec.priority}
                                            </span>
                                            <p className="text-sm">{rec.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right - Camera & AI Output */}
                    <div className="space-y-4">
                        {/* Camera Feed */}
                        {isAbnormal && (
                            <div className="glass-panel p-6 animate-fadeIn">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    Live Camera Feed
                                </h3>
                                <div className="camera-feed">
                                    <div className="text-center z-10">
                                        <Camera className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-2" />
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Capturing visual abnormalities...
                                        </p>
                                    </div>
                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#ff3b5c] px-3 py-1 rounded text-xs z-10">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                        RECORDING
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Diagnostic Output */}
                        <div
                            className={`p-6 rounded-xl ${isAbnormal
                                    ? 'bg-gradient-to-br from-[rgba(255,59,92,0.2)] to-[var(--bg-secondary)] border border-[rgba(255,59,92,0.3)]'
                                    : 'glass-panel'
                                }`}
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className={`w-5 h-5 ${isAbnormal ? 'text-[#ff3b5c]' : ''}`} />
                                AI Diagnostic Output
                            </h3>

                            {analysis.possibleDiseases.length > 0 ? (
                                <div className="space-y-4">
                                    {analysis.possibleDiseases.map((disease, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-[var(--bg-primary)]">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold">{disease.name}</h4>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${disease.riskLevel === 'High'
                                                            ? 'risk-high'
                                                            : disease.riskLevel === 'Medium'
                                                                ? 'risk-medium'
                                                                : 'risk-low'
                                                        }`}
                                                >
                                                    {disease.riskLevel} Risk
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-2">
                                                {disease.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${disease.riskLevel === 'High'
                                                                ? 'bg-[#ff3b5c]'
                                                                : disease.riskLevel === 'Medium'
                                                                    ? 'bg-[#ff9500]'
                                                                    : 'bg-[#00d4aa]'
                                                            }`}
                                                        style={{ width: `${disease.confidence}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    {disease.confidence}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-[#00d4aa] mx-auto mb-3" />
                                    <p className="text-[#00d4aa] font-semibold">No diseases detected</p>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        All parameters within healthy range
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <Stethoscope className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Ready for Analysis</h3>
                    <p className="text-[var(--text-secondary)]">
                        Enter a cow ID to begin health analysis
                    </p>
                </div>
            )}
        </div>
    );
}

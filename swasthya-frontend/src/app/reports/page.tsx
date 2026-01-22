'use client';

import { useState } from 'react';
import {
    FileText,
    Download,
    Printer,
    Share2,
    Search,
    Loader2,
    Calendar,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';

interface Report {
    cowId: string;
    generatedAt: string;
    period: { from: string; to: string };
    currentStatus: 'Normal' | 'Abnormal';
    latestReadings: {
        weight: number;
        temperature: number;
        gaitScore: number;
        activityLevel: number;
        loadImbalance: number;
    };
    analysis: {
        symptoms: Array<{ type: string; severity: string; value: number }>;
        possibleDiseases: Array<{ name: string; riskLevel: string; confidence: number }>;
        recommendations: Array<{ priority: string; action: string }>;
    };
    historySummary: {
        totalReadings: number;
        abnormalCount: number;
        avgTemperature: string;
        avgActivity: number;
    };
}

export default function ReportsPage() {
    const [cowId, setCowId] = useState('');
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cowId.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/cows/${cowId}/report`);
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!report) return;
        const content = JSON.stringify(report, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cow-${report.cowId}-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        if (!report) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Health Report - Cow ${report.cowId}`,
                    text: `Health status: ${report.currentStatus}`,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-1">Report Generation</h1>
                <p className="text-[var(--text-secondary)]">
                    Auto-generated health reports with analysis and recommendations
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleGenerateReport} className="glass-panel p-4 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={cowId}
                        onChange={(e) => setCowId(e.target.value)}
                        placeholder="Enter Cow ID to generate report"
                        className="input-field pl-12"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !cowId.trim()}
                    className="btn-primary flex items-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileText className="w-4 h-4" />
                    )}
                    Generate Report
                </button>
            </form>

            {/* Report Content */}
            {report ? (
                <div className="glass-panel p-8 print:bg-white print:text-black" id="report-content">
                    {/* Report Header */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-color)]">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Health Report</h2>
                            <p className="text-[var(--text-secondary)]">Cow ID: {report.cowId}</p>
                        </div>
                        <div className="flex items-center gap-3 print:hidden">
                            <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            <button onClick={handleShare} className="btn-secondary flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Report Info */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="glass-panel-dark p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Generated</span>
                            </div>
                            <p className="font-semibold">
                                {new Date(report.generatedAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="glass-panel-dark p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Total Readings</span>
                            </div>
                            <p className="font-semibold">{report.historySummary.totalReadings}</p>
                        </div>
                        <div className="glass-panel-dark p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
                                {report.currentStatus === 'Normal' ? (
                                    <CheckCircle className="w-4 h-4 text-[#00d4aa]" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-[#ff3b5c]" />
                                )}
                                <span className="text-sm">Current Status</span>
                            </div>
                            <span className={report.currentStatus === 'Normal' ? 'badge-normal' : 'badge-abnormal'}>
                                {report.currentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Latest Readings */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Latest Sensor Readings</h3>
                        <div className="grid grid-cols-5 gap-4">
                            <ReadingCard label="Weight" value={`${report.latestReadings.weight} lbs`} />
                            <ReadingCard
                                label="Temperature"
                                value={`${report.latestReadings.temperature}°F`}
                                isWarning={report.latestReadings.temperature > 103}
                            />
                            <ReadingCard
                                label="Gait Score"
                                value={`${report.latestReadings.gaitScore}/5`}
                                isWarning={report.latestReadings.gaitScore >= 3}
                            />
                            <ReadingCard
                                label="Activity"
                                value={`${report.latestReadings.activityLevel}%`}
                                isWarning={report.latestReadings.activityLevel < 20}
                            />
                            <ReadingCard
                                label="Load Imbalance"
                                value={`${report.latestReadings.loadImbalance}%`}
                                isWarning={report.latestReadings.loadImbalance > 15}
                            />
                        </div>
                    </div>

                    {/* Analysis Results */}
                    {report.analysis.symptoms.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4">Detected Symptoms</h3>
                            <div className="space-y-2">
                                {report.analysis.symptoms.map((symptom, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                                    >
                                        <span className="capitalize">
                                            {symptom.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[var(--text-secondary)]">Value: {symptom.value}</span>
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Possible Diseases */}
                    {report.analysis.possibleDiseases.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4">Possible Diseases</h3>
                            <div className="space-y-2">
                                {report.analysis.possibleDiseases.map((disease, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                                    >
                                        <span>{disease.name}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[var(--text-secondary)]">
                                                Confidence: {disease.confidence}%
                                            </span>
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Recommendations</h3>
                        <div className="space-y-2">
                            {report.analysis.recommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]"
                                >
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
                                        <p>{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <FileText className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generate a Report</h3>
                    <p className="text-[var(--text-secondary)]">
                        Enter a Cow ID above to generate a comprehensive health report
                    </p>
                </div>
            )}
        </div>
    );
}

function ReadingCard({
    label,
    value,
    isWarning,
}: {
    label: string;
    value: string;
    isWarning?: boolean;
}) {
    return (
        <div
            className={`p-4 rounded-lg ${isWarning ? 'bg-[rgba(255,59,92,0.1)] border border-[#ff3b5c]' : 'glass-panel-dark'
                }`}
        >
            <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
            <p className={`font-bold ${isWarning ? 'text-[#ff3b5c]' : ''}`}>{value}</p>
        </div>
    );
}

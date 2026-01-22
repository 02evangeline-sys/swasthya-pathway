'use client';

import { useEffect, useState } from 'react';
import { TelemetryData } from '@/hooks/useSocket';
import { ArrowDown, ArrowUp, Minus, Loader2 } from 'lucide-react';

interface HistoryTableProps {
    cowId: string | null;
    currentData: TelemetryData[];
}

interface HistoryRecord {
    timestamp: string;
    sensors: {
        weight: number;
        temperature: number;
        gaitScore: number;
        activityLevel: number;
        loadImbalance: number;
    };
    status: 'Normal' | 'Abnormal';
}

export default function HistoryTable({ cowId, currentData }: HistoryTableProps) {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (cowId) {
            fetchHistory(cowId);
        }
    }, [cowId]);

    const fetchHistory = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/cows/${id}/history?limit=20`);
            const data = await response.json();
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Combine historical and current data
    const allData = [...history, ...currentData].slice(-20);

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <ArrowUp className="w-3 h-3 text-[#00d4aa]" />;
        } else if (current < previous) {
            return <ArrowDown className="w-3 h-3 text-[#ff3b5c]" />;
        }
        return <Minus className="w-3 h-3 text-[var(--text-secondary)]" />;
    };

    if (!cowId) {
        return (
            <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">History & Trends</h3>
                <p className="text-[var(--text-secondary)] text-center py-8">
                    Select a cow to view history
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">History & Trends</h3>
                <span className="text-xs text-[var(--text-secondary)]">
                    Cow ID: {cowId} | {allData.length} records
                </span>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                                <th className="text-left py-3 px-2">Time</th>
                                <th className="text-right py-3 px-2">Weight</th>
                                <th className="text-right py-3 px-2">Temp</th>
                                <th className="text-right py-3 px-2">Gait</th>
                                <th className="text-right py-3 px-2">Activity</th>
                                <th className="text-center py-3 px-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allData
                                .slice()
                                .reverse()
                                .slice(0, 10)
                                .map((record, index, arr) => {
                                    const prevRecord = arr[index + 1];
                                    const isAbnormal = record.status === 'Abnormal';

                                    return (
                                        <tr
                                            key={record.timestamp}
                                            className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors ${isAbnormal ? 'bg-[rgba(255,59,92,0.1)]' : ''
                                                }`}
                                        >
                                            <td className="py-3 px-2 text-[var(--text-secondary)]">
                                                {new Date(record.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {prevRecord && getTrendIcon(record.sensors.weight, prevRecord.sensors.weight)}
                                                    {record.sensors.weight} lbs
                                                </div>
                                            </td>
                                            <td
                                                className={`py-3 px-2 text-right ${record.sensors.temperature > 103 ? 'text-[#ff3b5c]' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-end gap-1">
                                                    {prevRecord &&
                                                        getTrendIcon(record.sensors.temperature, prevRecord.sensors.temperature)}
                                                    {record.sensors.temperature}°F
                                                </div>
                                            </td>
                                            <td
                                                className={`py-3 px-2 text-right ${record.sensors.gaitScore >= 3 ? 'text-[#ff9500]' : ''
                                                    }`}
                                            >
                                                {record.sensors.gaitScore}/5
                                            </td>
                                            <td
                                                className={`py-3 px-2 text-right ${record.sensors.activityLevel < 20 ? 'text-[#ff3b5c]' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-end gap-1">
                                                    {prevRecord &&
                                                        getTrendIcon(record.sensors.activityLevel, prevRecord.sensors.activityLevel)}
                                                    {record.sensors.activityLevel}%
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${isAbnormal ? 'badge-abnormal' : 'badge-normal'
                                                        }`}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

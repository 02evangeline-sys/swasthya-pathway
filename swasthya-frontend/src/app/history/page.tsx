'use client';

import { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus,
    Loader2,
    TrendingUp,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

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

export default function HistoryPage() {
    const [cowId, setCowId] = useState('');
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'weight' | 'activity'>(
        'temperature'
    );

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cowId.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/cows/${cowId}/history?limit=100`);
            const data = await response.json();
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = history.map((record) => ({
        time: new Date(record.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        value:
            selectedMetric === 'temperature'
                ? record.sensors.temperature
                : selectedMetric === 'weight'
                    ? record.sensors.weight
                    : record.sensors.activityLevel,
        status: record.status,
    }));

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <ArrowUp className="w-3 h-3 text-[#00d4aa]" />;
        if (current < previous) return <ArrowDown className="w-3 h-3 text-[#ff3b5c]" />;
        return <Minus className="w-3 h-3 text-[var(--text-secondary)]" />;
    };

    const abnormalCount = history.filter((h) => h.status === 'Abnormal').length;
    const normalCount = history.length - abnormalCount;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-1">History & Records</h1>
                <p className="text-[var(--text-secondary)]">
                    Previous days&apos; data with trend comparison
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="glass-panel p-4 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={cowId}
                        onChange={(e) => setCowId(e.target.value)}
                        placeholder="Filter by Cow ID"
                        className="input-field pl-12"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
                    Load History
                </button>
            </form>

            {history.length > 0 ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <SummaryCard
                            title="Total Records"
                            value={history.length.toString()}
                            icon={History}
                        />
                        <SummaryCard
                            title="Normal Readings"
                            value={normalCount.toString()}
                            icon={TrendingUp}
                            color="#00d4aa"
                        />
                        <SummaryCard
                            title="Abnormal Readings"
                            value={abnormalCount.toString()}
                            icon={Filter}
                            color="#ff3b5c"
                        />
                        <SummaryCard
                            title="Abnormal Rate"
                            value={`${((abnormalCount / history.length) * 100).toFixed(1)}%`}
                            icon={Calendar}
                            color={abnormalCount > normalCount ? '#ff3b5c' : '#00d4aa'}
                        />
                    </div>

                    {/* Trend Chart */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Trend Comparison</h3>
                            <div className="flex gap-2">
                                {(['temperature', 'weight', 'activity'] as const).map((metric) => (
                                    <button
                                        key={metric}
                                        onClick={() => setSelectedMetric(metric)}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedMetric === metric
                                                ? 'bg-[var(--accent-primary)] text-white'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(136, 153, 166, 0.2)" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#8899a6"
                                        tick={{ fill: '#8899a6', fontSize: 10 }}
                                    />
                                    <YAxis stroke="#8899a6" tick={{ fill: '#8899a6', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a2332',
                                            border: '1px solid #38444d',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00d4aa"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold mb-4">Detailed Records</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                                        <th className="text-left py-3 px-2">Date & Time</th>
                                        <th className="text-right py-3 px-2">Weight</th>
                                        <th className="text-right py-3 px-2">Temp</th>
                                        <th className="text-right py-3 px-2">Gait</th>
                                        <th className="text-right py-3 px-2">Activity</th>
                                        <th className="text-right py-3 px-2">Imbalance</th>
                                        <th className="text-center py-3 px-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history
                                        .slice()
                                        .reverse()
                                        .slice(0, 20)
                                        .map((record, index, arr) => {
                                            const prev = arr[index + 1];
                                            const isAbnormal = record.status === 'Abnormal';
                                            return (
                                                <tr
                                                    key={record.timestamp}
                                                    className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] ${isAbnormal ? 'bg-[rgba(255,59,92,0.1)]' : ''
                                                        }`}
                                                >
                                                    <td className="py-3 px-2">
                                                        {new Date(record.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {prev && getTrendIcon(record.sensors.weight, prev.sensors.weight)}
                                                            {record.sensors.weight} lbs
                                                        </div>
                                                    </td>
                                                    <td
                                                        className={`py-3 px-2 text-right ${record.sensors.temperature > 103 ? 'text-[#ff3b5c]' : ''
                                                            }`}
                                                    >
                                                        {record.sensors.temperature}°F
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
                                                        {record.sensors.activityLevel}%
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {record.sensors.loadImbalance}%
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
                    </div>
                </>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <History className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No History Loaded</h3>
                    <p className="text-[var(--text-secondary)]">
                        Enter a Cow ID to view historical records and trends
                    </p>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    color = 'var(--accent-primary)',
}: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
}) {
    return (
        <div className="glass-panel p-4">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5" style={{ color }} />
                <span className="text-sm text-[var(--text-secondary)]">{title}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>
                {value}
            </p>
        </div>
    );
}

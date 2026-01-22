'use client';

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { TelemetryData } from '@/hooks/useSocket';

interface ChartProps {
    data: TelemetryData[];
    type: 'weight' | 'temperature' | 'gait' | 'activity';
    threshold?: number;
}

const chartConfig = {
    weight: {
        title: 'Weight Trend',
        unit: 'lbs',
        color: '#00E676',
        gradientId: 'weightGradient',
    },
    temperature: {
        title: 'Temperature',
        unit: '°F',
        color: '#FF5252',
        gradientId: 'tempGradient',
        threshold: 103,
    },
    gait: {
        title: 'Gait Score',
        unit: 'score',
        color: '#00BCD4',
        gradientId: 'gaitGradient',
        threshold: 3,
    },
    activity: {
        title: 'Activity Level',
        unit: '%',
        color: '#00E676',
        gradientId: 'activityGradient',
        threshold: 20,
    },
};

export default function HealthChart({ data, type, threshold }: ChartProps) {
    const config = chartConfig[type];
    const thresholdValue = threshold ?? config.threshold;

    const chartData = data.map((item, index) => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }),
        value:
            type === 'weight'
                ? item.sensors.weight
                : type === 'temperature'
                    ? item.sensors.temperature
                    : type === 'gait'
                        ? item.sensors.gaitScore
                        : item.sensors.activityLevel,
        index,
    }));

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 10, left: -10, bottom: 0 },
        };

        if (type === 'gait') {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(136, 153, 166, 0.2)" />
                    <XAxis
                        dataKey="time"
                        stroke="#8899a6"
                        tick={{ fill: '#8899a6', fontSize: 10 }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#8899a6"
                        tick={{ fill: '#8899a6', fontSize: 10 }}
                        tickLine={false}
                        domain={[0, 5]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1e1e1e',
                            border: '1px solid #333333',
                            borderRadius: '8px',
                            color: '#E0E0E0',
                        }}
                        formatter={(value: number) => [`${value} ${config.unit}`, config.title]}
                    />
                    {thresholdValue && (
                        <ReferenceLine
                            y={thresholdValue}
                            stroke="#FF5252"
                            strokeDasharray="5 5"
                            label={{ value: 'Threshold', fill: '#FF5252', fontSize: 10 }}
                        />
                    )}
                    <Bar
                        dataKey="value"
                        fill={config.color}
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={500}
                    />
                </BarChart>
            );
        }

        if (type === 'activity') {
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(136, 153, 166, 0.2)" />
                    <XAxis
                        dataKey="time"
                        stroke="#8899a6"
                        tick={{ fill: '#8899a6', fontSize: 10 }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#8899a6"
                        tick={{ fill: '#8899a6', fontSize: 10 }}
                        tickLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1e1e1e',
                            border: '1px solid #333333',
                            borderRadius: '8px',
                            color: '#E0E0E0',
                        }}
                        formatter={(value: number) => [`${value}${config.unit}`, config.title]}
                    />
                    {thresholdValue && (
                        <ReferenceLine
                            y={thresholdValue}
                            stroke="#FF5252"
                            strokeDasharray="5 5"
                            label={{ value: 'Min', fill: '#FF5252', fontSize: 10 }}
                        />
                    )}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={config.color}
                        fill={`url(#${config.gradientId})`}
                        isAnimationActive={true}
                        animationDuration={500}
                    />
                </AreaChart>
            );
        }

        // Default LineChart for weight and temperature
        return (
            <LineChart {...commonProps}>
                <defs>
                    <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136, 153, 166, 0.2)" />
                <XAxis
                    dataKey="time"
                    stroke="#8899a6"
                    tick={{ fill: '#8899a6', fontSize: 10 }}
                    tickLine={false}
                />
                <YAxis
                    stroke="#8899a6"
                    tick={{ fill: '#8899a6', fontSize: 10 }}
                    tickLine={false}
                    domain={type === 'temperature' ? [98, 106] : ['auto', 'auto']}
                />
                <Tooltip
                    contentStyle={{
                        background: '#1e1e1e',
                        border: '1px solid #333333',
                        borderRadius: '8px',
                        color: '#E0E0E0',
                    }}
                    formatter={(value: number) => [`${value} ${config.unit}`, config.title]}
                />
                {thresholdValue && (
                    <ReferenceLine
                        y={thresholdValue}
                        stroke="#FF5252"
                        strokeDasharray="5 5"
                        label={{ value: 'Max', fill: '#FF5252', fontSize: 10 }}
                    />
                )}
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={config.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={500}
                />
            </LineChart>
        );
    };

    const latestValue = chartData[chartData.length - 1]?.value;
    const isAboveThreshold =
        thresholdValue &&
        latestValue &&
        (type === 'activity' ? latestValue < thresholdValue : latestValue > thresholdValue);

    return (
        <div className="chart-container h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                    {config.title}
                </h3>
                {latestValue !== undefined && (
                    <span
                        className={`text-lg font-bold ${isAboveThreshold ? 'text-[#FF5252]' : 'text-[var(--accent-primary)]'
                            }`}
                    >
                        {latestValue.toFixed(1)} {config.unit}
                    </span>
                )}
            </div>
            <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

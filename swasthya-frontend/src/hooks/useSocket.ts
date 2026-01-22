'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SensorData {
    weight: number;
    temperature: number;
    gaitScore: number;
    activityLevel: number;
    loadImbalance: number;
}

export interface HealthAnalysis {
    cowId: string;
    timestamp: string;
    status: 'Normal' | 'Abnormal';
    symptoms: Array<{
        type: string;
        severity: string;
        value: number;
    }>;
    possibleDiseases: Array<{
        id: string;
        name: string;
        description: string;
        riskLevel: string;
        confidence: number;
    }>;
    recommendations: Array<{
        priority: string;
        action: string;
    }>;
    requiresAttention: boolean;
    shouldCaptureImage: boolean;
}

export interface TelemetryData {
    cowId: string;
    timestamp: string;
    sensors: SensorData;
    status: 'Normal' | 'Abnormal';
    abnormalityType: string | null;
    thresholds: {
        tempHigh: number;
        tempLow: number;
        activityLow: number;
        gaitAbnormal: number;
        weightImbalance: number;
    };
    analysis: HealthAnalysis;
}

export interface AlertData {
    cowId: string;
    type: string;
    message: string;
    data: SensorData;
    analysis: HealthAnalysis;
}

interface UseSocketReturn {
    isConnected: boolean;
    isMonitoring: boolean;
    currentData: TelemetryData | null;
    dataHistory: TelemetryData[];
    alerts: AlertData[];
    startMonitoring: (cowId: string) => void;
    stopMonitoring: () => void;
    clearAlerts: () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const MAX_HISTORY = 20;

export function useSocket(): UseSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [currentData, setCurrentData] = useState<TelemetryData | null>(null);
    const [dataHistory, setDataHistory] = useState<TelemetryData[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            setIsMonitoring(false);
        });

        socket.on('sensor:data', (data: TelemetryData) => {
            setCurrentData(data);
            setDataHistory(prev => {
                const updated = [...prev, data];
                return updated.slice(-MAX_HISTORY);
            });
        });

        socket.on('alert:triggered', (alert: AlertData) => {
            setAlerts(prev => [...prev, alert]);
            // Play alert sound if available
            if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(`⚠️ Alert: Cow ${alert.cowId}`, {
                        body: alert.message,
                        icon: '/favicon.ico'
                    });
                }
            }
        });

        socket.on('monitor:started', (data: { cowId: string; message: string }) => {
            console.log(data.message);
            setIsMonitoring(true);
        });

        socket.on('monitor:stopped', () => {
            setIsMonitoring(false);
            setCurrentData(null);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const startMonitoring = useCallback((cowId: string) => {
        if (socketRef.current?.connected) {
            setDataHistory([]);
            socketRef.current.emit('monitor:start', cowId);
        }
    }, []);

    const stopMonitoring = useCallback(() => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('monitor:stop');
        }
    }, []);

    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return {
        isConnected,
        isMonitoring,
        currentData,
        dataHistory,
        alerts,
        startMonitoring,
        stopMonitoring,
        clearAlerts,
    };
}

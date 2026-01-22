'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
    Bell,
    BellOff,
    Volume2,
    VolumeX,
    AlertTriangle,
    X,
    Trash2,
    ExternalLink,
} from 'lucide-react';

export default function AlertsPage() {
    const { alerts, clearAlerts, isConnected, startMonitoring } = useSocket();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                setNotificationsEnabled(permission === 'granted');
            });
        } else if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
    }, []);

    // Play sound on new alert
    useEffect(() => {
        if (alerts.length > 0 && soundEnabled) {
            // Play a simple beep sound
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }, [alerts.length, soundEnabled]);

    // Demo mode - start monitoring a random cow
    const handleDemoMode = () => {
        const demoIds = ['COW-001', 'COW-002', 'COW-003', 'COW-DEMO'];
        const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];
        startMonitoring(randomId);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Alert System</h1>
                    <p className="text-[var(--text-secondary)]">
                        Real-time alerts and notifications
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Sound Toggle */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-3 rounded-lg transition-colors ${soundEnabled
                                ? 'bg-[rgba(0,212,170,0.15)] text-[#00d4aa]'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                            }`}
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>

                    {/* Notification Toggle */}
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`p-3 rounded-lg transition-colors ${notificationsEnabled
                                ? 'bg-[rgba(0,212,170,0.15)] text-[#00d4aa]'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                            }`}
                    >
                        {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>

                    {/* Clear All */}
                    {alerts.length > 0 && (
                        <button
                            onClick={clearAlerts}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            <div
                className={`glass-panel p-4 flex items-center justify-between ${isConnected ? 'border-[#00d4aa]' : 'border-[#ff3b5c]'
                    } border`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00d4aa] animate-pulse' : 'bg-[#ff3b5c]'
                            }`}
                    ></div>
                    <span>
                        {isConnected ? 'Connected to alert stream' : 'Disconnected from server'}
                    </span>
                </div>
                {isConnected && (
                    <button onClick={handleDemoMode} className="btn-primary text-sm py-2 px-4">
                        Start Demo Monitoring
                    </button>
                )}
            </div>

            {/* Alerts List */}
            {alerts.length > 0 ? (
                <div className="space-y-4">
                    {alerts
                        .slice()
                        .reverse()
                        .map((alert, index) => (
                            <div
                                key={`${alert.cowId}-${index}`}
                                className="glass-panel p-5 border-l-4 border-[#ff3b5c] animate-slideIn"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[rgba(255,59,92,0.2)] flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-[#ff3b5c]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="badge-abnormal">Alert</span>
                                                <span className="text-sm text-[var(--text-secondary)]">
                                                    Cow ID: {alert.cowId}
                                                </span>
                                            </div>
                                            <p className="font-semibold mb-2">{alert.message}</p>
                                            <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                                                <span>Temp: {alert.data.temperature}°F</span>
                                                <span>Activity: {alert.data.activityLevel}%</span>
                                                <span>Gait: {alert.data.gaitScore}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={`/analysis`}
                                        className="flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
                                    >
                                        <span className="text-sm">View Report</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <Bell className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Active Alerts</h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        Alerts will appear here when abnormalities are detected
                    </p>
                    {isConnected && (
                        <button onClick={handleDemoMode} className="btn-primary">
                            Start Demo to Generate Alerts
                        </button>
                    )}
                </div>
            )}

            {/* Alert Settings */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-4">Alert Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                    <SettingCard
                        title="Sound Alerts"
                        description="Play audio when alerts trigger"
                        enabled={soundEnabled}
                        onToggle={() => setSoundEnabled(!soundEnabled)}
                    />
                    <SettingCard
                        title="Browser Notifications"
                        description="Show desktop notifications"
                        enabled={notificationsEnabled}
                        onToggle={() => {
                            if (Notification.permission !== 'granted') {
                                Notification.requestPermission();
                            } else {
                                setNotificationsEnabled(!notificationsEnabled);
                            }
                        }}
                    />
                    <SettingCard
                        title="Auto-Clear Old Alerts"
                        description="Remove alerts older than 1 hour"
                        enabled={false}
                        onToggle={() => { }}
                    />
                </div>
            </div>
        </div>
    );
}

function SettingCard({
    title,
    description,
    enabled,
    onToggle,
}: {
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="glass-panel-dark p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{title}</span>
                <button
                    onClick={onToggle}
                    className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#00d4aa]' : 'bg-[var(--bg-tertiary)]'
                        }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                    ></div>
                </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{description}</p>
        </div>
    );
}

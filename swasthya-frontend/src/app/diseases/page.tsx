'use client';

import { useState, useEffect } from 'react';
import { Scan, AlertTriangle, Search, Loader2 } from 'lucide-react';

interface Disease {
    id: string;
    name: string;
    description: string;
    symptoms: string[];
}

export default function DiseasesPage() {
    const [diseases, setDiseases] = useState<Record<string, Disease>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/diseases');
            const data = await response.json();
            setDiseases(data);
        } catch (error) {
            console.error('Failed to fetch diseases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDiseases = Object.entries(diseases).filter(([key, disease]) =>
        disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disease.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRiskColor = (symptoms: string[]) => {
        if (symptoms.length >= 3) return { bg: 'risk-high', label: 'High Severity' };
        if (symptoms.length >= 2) return { bg: 'risk-medium', label: 'Medium Severity' };
        return { bg: 'risk-low', label: 'Low Severity' };
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-1">Disease Detection</h1>
                <p className="text-[var(--text-secondary)]">
                    Possible diseases based on combined sensor + vision + historical data
                </p>
            </div>

            {/* Search */}
            <div className="glass-panel p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search diseases..."
                        className="input-field pl-12"
                    />
                </div>
            </div>

            {/* Disease List */}
            {isLoading ? (
                <div className="glass-panel p-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mx-auto" />
                    <p className="text-[var(--text-secondary)] mt-4">Loading disease database...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filteredDiseases.map(([key, disease]) => {
                        const risk = getRiskColor(disease.symptoms);
                        return (
                            <div key={key} className="glass-panel p-6 hover:border-[var(--accent-primary)] transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                                            <Scan className="w-5 h-5 text-[var(--accent-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{disease.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded ${risk.bg}`}>
                                                {risk.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    {disease.description}
                                </p>

                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                                        Detection Symptoms:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {disease.symptoms.map((symptom, i) => (
                                            <span
                                                key={i}
                                                className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                            >
                                                {symptom}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Risk Level Legend */}
            <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold mb-3">Risk Level Legend</h3>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded risk-low">Low</span>
                        <span className="text-xs text-[var(--text-secondary)]">1 symptom match</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded risk-medium">Medium</span>
                        <span className="text-xs text-[var(--text-secondary)]">2 symptom matches</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded risk-high">High</span>
                        <span className="text-xs text-[var(--text-secondary)]">3+ symptom matches</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

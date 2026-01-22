/**
 * Disease Detection Logic for Swasthya Pathway
 * Rule-based disease detection with risk assessment
 */

const DISEASES = {
    mastitis: {
        name: 'Mastitis',
        symptoms: ['fever', 'udderTemp'],
        description: 'Udder infection causing inflammation'
    },
    lameness: {
        name: 'Lameness / Hoof Disease',
        symptoms: ['gaitAbnormal', 'weightImbalance', 'lowActivity'],
        description: 'Foot or leg issues affecting mobility'
    },
    metabolicDisorder: {
        name: 'Metabolic Disorder',
        symptoms: ['weightLoss', 'lowActivity'],
        description: 'Nutritional or metabolic imbalance'
    },
    respiratoryInfection: {
        name: 'Respiratory Infection',
        symptoms: ['fever', 'lowActivity'],
        description: 'Respiratory tract infection'
    },
    digestiveIssue: {
        name: 'Digestive Issue',
        symptoms: ['weightLoss', 'lowActivity', 'fever'],
        description: 'Gastrointestinal problems'
    }
};

function detectSymptoms(sensorData) {
    const symptoms = [];
    const { sensors, thresholds } = sensorData;

    if (sensors.temperature > thresholds.tempHigh) {
        symptoms.push({ type: 'fever', severity: 'high', value: sensors.temperature });
    } else if (sensors.temperature > thresholds.tempHigh - 0.5) {
        symptoms.push({ type: 'fever', severity: 'medium', value: sensors.temperature });
    }

    if (sensors.activityLevel < thresholds.activityLow) {
        symptoms.push({ type: 'lowActivity', severity: 'high', value: sensors.activityLevel });
    } else if (sensors.activityLevel < thresholds.activityLow + 10) {
        symptoms.push({ type: 'lowActivity', severity: 'medium', value: sensors.activityLevel });
    }

    if (sensors.gaitScore >= thresholds.gaitAbnormal) {
        const severity = sensors.gaitScore >= 4 ? 'high' : 'medium';
        symptoms.push({ type: 'gaitAbnormal', severity, value: sensors.gaitScore });
    }

    if (sensors.loadImbalance > thresholds.weightImbalance) {
        symptoms.push({ type: 'weightImbalance', severity: 'medium', value: sensors.loadImbalance });
    }

    return symptoms;
}

function calculateRiskLevel(matchingSymptoms, totalRequired) {
    const ratio = matchingSymptoms / totalRequired;
    if (ratio >= 0.8) return 'High';
    if (ratio >= 0.5) return 'Medium';
    return 'Low';
}

function analyzeHealth(sensorData, historicalData = []) {
    const symptoms = detectSymptoms(sensorData);
    const symptomTypes = symptoms.map(s => s.type);

    const possibleDiseases = [];

    for (const [key, disease] of Object.entries(DISEASES)) {
        const matchingSymptoms = disease.symptoms.filter(s => symptomTypes.includes(s));

        if (matchingSymptoms.length > 0) {
            possibleDiseases.push({
                id: key,
                name: disease.name,
                description: disease.description,
                matchingSymptoms,
                riskLevel: calculateRiskLevel(matchingSymptoms.length, disease.symptoms.length),
                confidence: Math.round((matchingSymptoms.length / disease.symptoms.length) * 100)
            });
        }
    }

    // Sort by confidence
    possibleDiseases.sort((a, b) => b.confidence - a.confidence);

    // Generate recommendations
    const recommendations = generateRecommendations(symptoms, possibleDiseases);

    return {
        cowId: sensorData.cowId,
        timestamp: sensorData.timestamp,
        status: sensorData.status,
        symptoms,
        possibleDiseases,
        recommendations,
        requiresAttention: symptoms.some(s => s.severity === 'high'),
        shouldCaptureImage: sensorData.status === 'Abnormal'
    };
}

function generateRecommendations(symptoms, diseases) {
    const recommendations = [];

    if (symptoms.some(s => s.type === 'fever' && s.severity === 'high')) {
        recommendations.push({
            priority: 'urgent',
            action: 'Isolate cow and contact veterinarian immediately'
        });
    }

    if (symptoms.some(s => s.type === 'gaitAbnormal')) {
        recommendations.push({
            priority: 'high',
            action: 'Inspect hooves for injuries or infection'
        });
    }

    if (symptoms.some(s => s.type === 'lowActivity')) {
        recommendations.push({
            priority: 'medium',
            action: 'Monitor eating and drinking behavior'
        });
    }

    if (diseases.some(d => d.name === 'Mastitis')) {
        recommendations.push({
            priority: 'high',
            action: 'Check udder for swelling, heat, or abnormal milk'
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'low',
            action: 'Continue routine monitoring'
        });
    }

    return recommendations;
}

module.exports = {
    analyzeHealth,
    detectSymptoms,
    DISEASES
};

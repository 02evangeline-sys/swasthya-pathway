/**
 * Mock Sensor Data Generator for Swasthya Pathway
 * Generates realistic bovine health metrics every 3 seconds
 */

// Baseline values for healthy cows
const HEALTHY_BASELINE = {
    weight: { min: 900, max: 1100, unit: 'lbs' },
    temperature: { min: 100.5, max: 102.5, unit: '°F' },
    gaitScore: { min: 1, max: 2, unit: 'score' },
    activityLevel: { min: 40, max: 80, unit: '%' }
};

// Abnormal thresholds
const THRESHOLDS = {
    tempHigh: 103,
    tempLow: 99.5,
    activityLow: 20,
    gaitAbnormal: 3,
    weightImbalance: 15
};

// Store cow states for consistent simulation
const cowStates = new Map();

function initCowState(cowId) {
    if (!cowStates.has(cowId)) {
        cowStates.set(cowId, {
            baseWeight: randomBetween(HEALTHY_BASELINE.weight.min, HEALTHY_BASELINE.weight.max),
            baseTemp: randomBetween(HEALTHY_BASELINE.temperature.min, HEALTHY_BASELINE.temperature.max),
            isHealthy: Math.random() > 0.3, // 70% healthy, 30% may develop issues
            abnormalityType: null,
            readings: []
        });
    }
    return cowStates.get(cowId);
}

function randomBetween(min, max, decimals = 1) {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
}

function generateFluctuation(base, range) {
    return base + randomBetween(-range, range);
}

function generateSensorData(cowId) {
    const state = initCowState(cowId);
    const timestamp = new Date().toISOString();

    // Occasionally trigger abnormality (10% chance per reading if not healthy)
    if (!state.isHealthy && !state.abnormalityType && Math.random() < 0.1) {
        const abnormalities = ['fever', 'lowActivity', 'lameness', 'weightLoss'];
        state.abnormalityType = abnormalities[Math.floor(Math.random() * abnormalities.length)];
    }

    let weight, temperature, gaitScore, activityLevel, loadImbalance;

    // Generate values based on health state
    if (state.isHealthy || !state.abnormalityType) {
        // Normal healthy readings
        weight = generateFluctuation(state.baseWeight, 5);
        temperature = generateFluctuation(state.baseTemp, 0.5);
        gaitScore = Math.random() > 0.9 ? 2 : 1;
        activityLevel = randomBetween(45, 75);
        loadImbalance = randomBetween(0, 8);
    } else {
        // Abnormal readings based on type
        switch (state.abnormalityType) {
            case 'fever':
                weight = generateFluctuation(state.baseWeight, 5);
                temperature = randomBetween(103.2, 105);
                gaitScore = Math.random() > 0.7 ? 2 : 1;
                activityLevel = randomBetween(25, 45);
                loadImbalance = randomBetween(0, 10);
                break;
            case 'lowActivity':
                weight = generateFluctuation(state.baseWeight, 8);
                temperature = generateFluctuation(state.baseTemp, 0.8);
                gaitScore = randomBetween(1, 3);
                activityLevel = randomBetween(10, 22);
                loadImbalance = randomBetween(5, 12);
                break;
            case 'lameness':
                weight = generateFluctuation(state.baseWeight, 5);
                temperature = generateFluctuation(state.baseTemp + 0.5, 0.5);
                gaitScore = randomBetween(3, 5);
                activityLevel = randomBetween(20, 40);
                loadImbalance = randomBetween(12, 25);
                break;
            case 'weightLoss':
                weight = state.baseWeight - randomBetween(20, 50);
                temperature = generateFluctuation(state.baseTemp, 0.5);
                gaitScore = Math.random() > 0.8 ? 2 : 1;
                activityLevel = randomBetween(30, 50);
                loadImbalance = randomBetween(8, 18);
                break;
            default:
                weight = generateFluctuation(state.baseWeight, 5);
                temperature = generateFluctuation(state.baseTemp, 0.5);
                gaitScore = 1;
                activityLevel = randomBetween(45, 75);
                loadImbalance = randomBetween(0, 8);
        }
    }

    // Determine status
    const isAbnormal =
        temperature > THRESHOLDS.tempHigh ||
        temperature < THRESHOLDS.tempLow ||
        activityLevel < THRESHOLDS.activityLow ||
        gaitScore >= THRESHOLDS.gaitAbnormal ||
        loadImbalance > THRESHOLDS.weightImbalance;

    const data = {
        cowId,
        timestamp,
        sensors: {
            weight: parseFloat(weight.toFixed(1)),
            temperature: parseFloat(temperature.toFixed(1)),
            gaitScore: Math.round(gaitScore),
            activityLevel: Math.round(activityLevel),
            loadImbalance: parseFloat(loadImbalance.toFixed(1))
        },
        status: isAbnormal ? 'Abnormal' : 'Normal',
        abnormalityType: isAbnormal ? state.abnormalityType : null,
        thresholds: THRESHOLDS
    };

    // Store reading for history
    state.readings.push(data);
    if (state.readings.length > 100) {
        state.readings.shift();
    }

    return data;
}

function getCowHistory(cowId, limit = 50) {
    const state = cowStates.get(cowId);
    if (!state) {
        // Generate some historical data
        initCowState(cowId);
        for (let i = 0; i < 20; i++) {
            generateSensorData(cowId);
        }
        return cowStates.get(cowId).readings.slice(-limit);
    }
    return state.readings.slice(-limit);
}

function getAllCows() {
    return Array.from(cowStates.keys());
}

function getThresholds() {
    return THRESHOLDS;
}

module.exports = {
    generateSensorData,
    getCowHistory,
    getAllCows,
    getThresholds,
    initCowState
};

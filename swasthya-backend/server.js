/**
 * Swasthya Pathway - Backend Server
 * Express + Socket.io for real-time bovine health monitoring
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { generateSensorData, getCowHistory, getAllCows, getThresholds, initCowState } = require('./mockSensors');
const { analyzeHealth, DISEASES } = require('./diseaseDetection');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Store active monitoring sessions
const activeMonitors = new Map();

// OTP storage (in production, use Redis/database)
const otpStore = new Map();

// ============ REST API Routes ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Swasthya Pathway Backend Running' });
});

// OTP Authentication
app.post('/api/auth/send-otp', (req, res) => {
    const { mobile } = req.body;
    if (!mobile || mobile.length !== 10) {
        return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(mobile, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log(`OTP for ${mobile}: ${otp}`); // In production, send SMS
    res.json({ success: true, message: 'OTP sent successfully' });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { mobile, otp } = req.body;
    const stored = otpStore.get(mobile);

    if (!stored) {
        return res.status(400).json({ error: 'OTP expired or not found' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > stored.expires) {
        otpStore.delete(mobile);
        return res.status(400).json({ error: 'OTP expired' });
    }

    otpStore.delete(mobile);
    res.json({
        success: true,
        token: `farmer_${mobile}_${Date.now()}`,
        user: { mobile, name: `Farmer ${mobile.slice(-4)}` }
    });
});

// Get cow history
app.get('/api/cows/:cowId/history', (req, res) => {
    const { cowId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const history = getCowHistory(cowId, limit);
    res.json({ cowId, history, count: history.length });
});

// Get all registered cows
app.get('/api/cows', (req, res) => {
    const cows = getAllCows();
    res.json({ cows, count: cows.length });
});

// Get thresholds
app.get('/api/thresholds', (req, res) => {
    res.json(getThresholds());
});

// Get disease definitions
app.get('/api/diseases', (req, res) => {
    res.json(DISEASES);
});

// Get current sensor data for a cow
app.get('/api/cows/:cowId/current', (req, res) => {
    const { cowId } = req.params;
    initCowState(cowId);
    const data = generateSensorData(cowId);
    const analysis = analyzeHealth(data);
    res.json({ ...data, analysis });
});

// Generate health report
app.get('/api/cows/:cowId/report', (req, res) => {
    const { cowId } = req.params;
    const history = getCowHistory(cowId, 20);
    const latestData = history[history.length - 1] || generateSensorData(cowId);
    const analysis = analyzeHealth(latestData, history);

    const report = {
        cowId,
        generatedAt: new Date().toISOString(),
        period: {
            from: history[0]?.timestamp || new Date().toISOString(),
            to: latestData.timestamp
        },
        currentStatus: latestData.status,
        latestReadings: latestData.sensors,
        analysis,
        historySummary: {
            totalReadings: history.length,
            abnormalCount: history.filter(h => h.status === 'Abnormal').length,
            avgTemperature: (history.reduce((sum, h) => sum + h.sensors.temperature, 0) / history.length).toFixed(1),
            avgActivity: Math.round(history.reduce((sum, h) => sum + h.sensors.activityLevel, 0) / history.length)
        }
    };

    res.json(report);
});

// ============ Socket.io Real-time ============

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Start monitoring a specific cow
    socket.on('monitor:start', (cowId) => {
        console.log(`Starting monitor for cow: ${cowId}`);

        // Initialize cow state
        initCowState(cowId);

        // Stop any existing monitor for this socket
        if (activeMonitors.has(socket.id)) {
            clearInterval(activeMonitors.get(socket.id).interval);
        }

        // Send initial data
        const initialData = generateSensorData(cowId);
        const initialAnalysis = analyzeHealth(initialData);
        socket.emit('sensor:data', { ...initialData, analysis: initialAnalysis });

        // Start emitting data every 3 seconds
        const interval = setInterval(() => {
            const data = generateSensorData(cowId);
            const analysis = analyzeHealth(data);
            socket.emit('sensor:data', { ...data, analysis });

            // Emit alert if abnormal
            if (data.status === 'Abnormal') {
                socket.emit('alert:triggered', {
                    cowId,
                    type: 'abnormal',
                    message: `Abnormal readings detected for Cow ${cowId}`,
                    data: data.sensors,
                    analysis
                });
            }
        }, 3000);

        activeMonitors.set(socket.id, { cowId, interval });
        socket.emit('monitor:started', { cowId, message: `Now monitoring cow ${cowId}` });
    });

    // Stop monitoring
    socket.on('monitor:stop', () => {
        if (activeMonitors.has(socket.id)) {
            clearInterval(activeMonitors.get(socket.id).interval);
            activeMonitors.delete(socket.id);
            socket.emit('monitor:stopped', { message: 'Monitoring stopped' });
        }
    });

    // Request history
    socket.on('history:request', (cowId) => {
        const history = getCowHistory(cowId);
        socket.emit('history:data', { cowId, history });
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (activeMonitors.has(socket.id)) {
            clearInterval(activeMonitors.get(socket.id).interval);
            activeMonitors.delete(socket.id);
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   SWASTHYA PATHWAY                        ║
║           Bovine Health Monitoring System                 ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                ║
║  Socket.io ready for real-time connections                ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

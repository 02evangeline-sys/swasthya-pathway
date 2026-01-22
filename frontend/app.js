/**
 * Task Manager Frontend - Integrates with Python Flask Backend
 */

const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');
const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');

// State
let tasks = [];

/**
 * Update connection status UI
 */
function updateStatus(status, message) {
    statusBar.className = 'status-bar ' + status;
    statusText.textContent = message;
}

/**
 * Check backend health
 */
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            const data = await response.json();
            updateStatus('connected', `✓ ${data.message}`);
            return true;
        }
        throw new Error('Backend not responding');
    } catch (error) {
        updateStatus('error', '✗ Cannot connect to backend');
        console.error('Health check failed:', error);
        return false;
    }
}

/**
 * Fetch all tasks from backend
 */
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');

        const data = await response.json();
        tasks = data.tasks;
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

/**
 * Add a new task
 */
async function addTask(title) {
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (!response.ok) throw new Error('Failed to add task');

        const data = await response.json();
        tasks.push(data.task);
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Is the backend running?');
    }
}

/**
 * Toggle task completion
 */
async function toggleTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT'
        });

        if (!response.ok) throw new Error('Failed to update task');

        const data = await response.json();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = data.task;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Render tasks to the DOM
 */
function renderTasks() {
    if (tasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    tasksList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <label class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="checkmark"></span>
            </label>
            <span class="task-title">${escapeHtml(task.title)}</span>
            <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete task">🗑️</button>
        </li>
    `).join('');
}

/**
 * Update stats display
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title) {
        await addTask(title);
        taskInput.value = '';
        taskInput.focus();
    }
});

// Initialize
async function init() {
    updateStatus('', 'Connecting to backend...');
    const isHealthy = await checkHealth();
    if (isHealthy) {
        await fetchTasks();
    }
}

// Start the app
init();

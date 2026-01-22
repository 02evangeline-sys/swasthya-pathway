# Swasthya Pathway - Task Manager

A simple task management application with a Python Flask backend and vanilla JavaScript frontend.

## Features

- ✅ Create, Read, Update, Delete tasks
- 📊 Real-time task statistics
- 🎨 Modern dark theme UI
- 🔄 Backend-Frontend integration via REST API

## Project Structure

```
pathway/
├── backend/
│   ├── app.py           # Flask API server
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── index.html       # Main HTML page
│   ├── styles.css       # CSS styling
│   └── app.js           # JavaScript logic
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API will run on `http://localhost:5000`

### Frontend

Open `frontend/index.html` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Add new task |
| PUT | `/api/tasks/:id` | Toggle task completion |
| DELETE | `/api/tasks/:id` | Delete a task |

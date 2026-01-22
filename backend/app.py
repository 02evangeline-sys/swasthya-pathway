"""
Simple Flask Backend API
"""
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# In-memory data store
tasks = [
    {"id": 1, "title": "Learn Python", "completed": False},
    {"id": 2, "title": "Build API", "completed": True},
    {"id": 3, "title": "Create Frontend", "completed": False}
]

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Backend is running!"})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify({"tasks": tasks})

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    new_id = max([t['id'] for t in tasks], default=0) + 1
    new_task = {
        "id": new_id,
        "title": data['title'],
        "completed": False
    }
    tasks.append(new_task)
    return jsonify({"task": new_task, "message": "Task added successfully"}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def toggle_task(task_id):
    """Toggle task completion status"""
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = not task['completed']
            return jsonify({"task": task, "message": "Task updated"})
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks
    original_length = len(tasks)
    tasks = [t for t in tasks if t['id'] != task_id]
    if len(tasks) < original_length:
        return jsonify({"message": "Task deleted successfully"})
    return jsonify({"error": "Task not found"}), 404

if __name__ == '__main__':
    print("🚀 Starting Flask Backend on http://localhost:5000")
    app.run(debug=True, port=5000)

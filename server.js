// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpw',
  database: 'video_production'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('MySQL connected!');
});

// Get all projects
app.get('/api/projects', (req, res) => {
  db.query('SELECT * FROM projects', (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.query(`
    SELECT t.*, p.name as phase_name, tm.name as owner_name, tm.avatar_color
    FROM tasks t
    LEFT JOIN phases p ON t.phase_id = p.id
    LEFT JOIN team_members tm ON t.owner_id = tm.id
    ORDER BY t.phase_id, t.start_date
  `, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all phases
app.get('/api/phases', (req, res) => {
  db.query('SELECT * FROM phases ORDER BY order_num', (err, results) => {
    if (err) {
      console.error('Error fetching phases:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all team members
app.get('/api/team-members', (req, res) => {
  db.query('SELECT * FROM team_members', (err, results) => {
    if (err) {
      console.error('Error fetching team members:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add new task
app.post('/api/tasks', (req, res) => {
  const task = req.body;
  console.log('Creating task:', task);
  
  db.query('INSERT INTO tasks SET ?', task, (err, result) => {
    if (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Task created successfully, ID:', result.insertId);
    res.json({ id: result.insertId, ...task });
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = req.body;
  console.log('Updating task:', id, task);
  
  db.query('UPDATE tasks SET ? WHERE id = ?', [task, id], (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Task updated successfully');
    res.json({ id, ...task });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  console.log('Deleting task:', id);
  
  db.query('DELETE FROM tasks WHERE id = ?', id, (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Task deleted successfully');
    res.json({ success: true });
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(5501, () => {
  console.log('Server running on http://localhost:5501');
  console.log('API endpoints:');
  console.log('  GET    /api/projects');
  console.log('  GET    /api/tasks');
  console.log('  GET    /api/phases');
  console.log('  GET    /api/team-members');
  console.log('  POST   /api/tasks');
  console.log('  PUT    /api/tasks/:id');
  console.log('  DELETE /api/tasks/:id');
});




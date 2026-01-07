// server.js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection (LOCAL + RENDER SAFE)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpw",
  database: process.env.DB_NAME || "video_production",
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("MySQL connected");
});

// -------- ROUTES --------

// Projects
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Tasks
app.get("/api/tasks", (req, res) => {
  db.query(`
    SELECT t.*, p.name AS phase_name, tm.name AS owner_name, tm.avatar_color
    FROM tasks t
    LEFT JOIN phases p ON t.phase_id = p.id
    LEFT JOIN team_members tm ON t.owner_id = tm.id
    ORDER BY t.phase_id, t.start_date
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Phases
app.get("/api/phases", (req, res) => {
  db.query("SELECT * FROM phases ORDER BY order_num", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Team members
app.get("/api/team-members", (req, res) => {
  db.query("SELECT * FROM team_members", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add task
app.post("/api/tasks", (req, res) => {
  db.query("INSERT INTO tasks SET ?", req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, ...req.body });
  });
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
  db.query(
    "UPDATE tasks SET ? WHERE id = ?",
    [req.body, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id = ?",
    req.params.id,
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// START SERVER (RENDER NEEDS THIS)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

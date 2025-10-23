const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const port = 3001; // Port for the backend server

app.use(cors());
app.use(express.json());

// --- Database Connection ---
// !!! IMPORTANT !!!
// Replace these with your actual MySQL connection details.
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234', // <-- REPLACE WITH YOUR PASSWORD
    database: 'task_manager'
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log("MySQL connection pool created successfully.");
} catch (error) {
    console.error("Failed to create MySQL connection pool:", error);
    process.exit(1);
}

// --- Helper Functions ---
const getTasksWithDetails = async () => {
    const [tasks] = await pool.query('SELECT * FROM tasks ORDER BY title ASC');
    for (const task of tasks) {
        const [assignees] = await pool.query(`
                SELECT p.id, p.name, p.email, p.avatarUrl FROM people p
            JOIN task_assignees ta ON p.id = ta.person_id
            WHERE ta.task_id = ?
        `, [task.id]);
            const [feedback] = await pool.query(`
                SELECT f.*, p.name as user_name, p.avatarUrl as user_avatar 
                FROM feedback f
                LEFT JOIN people p ON f.user_id = p.id
                WHERE f.task_id = ? 
                ORDER BY f.timestamp DESC
            `, [task.id]);
        task.assignees = assignees;
        task.feedback = feedback;
        // Format date to YYYY-MM-DD for consistency
        if (task.dueDate) {
            task.dueDate = new Date(task.dueDate).toISOString().split('T')[0];
        }
    }
    return tasks;
};

// --- API Endpoints ---
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// POST login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const [users] = await pool.query('SELECT id, name, email, avatarUrl FROM people WHERE email = ? AND password = ?', [email, password]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({ user: users[0], message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

// GET all people
app.get('/api/people', async (req, res) => {
    try {
        const [people] = await pool.query('SELECT id, name, email, avatarUrl FROM people');
        res.json(people);
    } catch (err) {
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

// GET all tasks with details
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await getTasksWithDetails();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    const { title, description, assigneeIds, dueDate } = req.body;
    if (!title || !description || !assigneeIds || assigneeIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const taskId = randomUUID();
        const status = 'Yeni Talep';

        await connection.query(
            'INSERT INTO tasks (id, title, description, status, dueDate) VALUES (?, ?, ?, ?, ?)',
            [taskId, title, description, status, dueDate || null]
        );

        for (const personId of assigneeIds) {
            await connection.query(
                'INSERT INTO task_assignees (task_id, person_id) VALUES (?, ?)',
                [taskId, personId]
            );
        }

        await connection.commit();
        const tasks = await getTasksWithDetails(); // Return all tasks to update UI
        res.status(201).json(tasks);
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to create task', details: err.message });
    } finally {
        connection.release();
    }
});

// PUT (update) a task
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status, assignees, dueDate } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        
        // Update status and due date
        await connection.query(
            'UPDATE tasks SET status = ?, dueDate = ? WHERE id = ?',
            [status, dueDate === undefined ? null : dueDate, id]
        );

        // Update assignees
        await connection.query('DELETE FROM task_assignees WHERE task_id = ?', [id]);
        if (assignees && assignees.length > 0) {
            for (const person of assignees) {
                await connection.query(
                    'INSERT INTO task_assignees (task_id, person_id) VALUES (?, ?)',
                    [id, person.id]
                );
            }
        }
        
        await connection.commit();
        const tasks = await getTasksWithDetails();
        res.json(tasks);
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to update task', details: err.message });
    } finally {
        connection.release();
    }
});

// POST new feedback for a task
app.post('/api/tasks/:id/feedback', async (req, res) => {
    const { id: taskId } = req.params;
        const { text, userId } = req.body;
        if (!text || !userId) {
            return res.status(400).json({ error: 'Feedback text and userId are required' });
    }
    
    try {
        const feedbackId = randomUUID();
        const timestamp = new Date();
        await pool.query(
                'INSERT INTO feedback (id, text, timestamp, task_id, user_id) VALUES (?, ?, ?, ?, ?)',
                [feedbackId, text, timestamp, taskId, userId]
        );
        const tasks = await getTasksWithDetails();
        res.status(201).json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add feedback', details: err.message });
    }
});

const testDbConnection = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Could not connect to the database.');
        console.error('Please check that your MySQL server is running and the credentials in `backend/server.js` are correct.');
        console.error('Error details:', error.message);
        process.exit(1); // Exit the process with an error code
    } finally {
        if (connection) connection.release();
    }
};

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    testDbConnection();
});
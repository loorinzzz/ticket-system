const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/developers', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email FROM users WHERE role = 'developer'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch developers' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const [result] = await pool.query(
      'INSERT INTO tickets (title, description, category, priority, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', category, priority || 'Medium', req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, status: 'Open' });
  } catch (err) {
    res.status(500).json({ error: 'Could not create ticket' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    let query = 'SELECT * FROM tickets';
    let params = [];
    if (req.user.role === 'requestor') {
      query += ' WHERE created_by = ?';
      params = [req.user.id];
    } else if (req.user.role === 'developer') {
      query += ' WHERE assigned_to = ?';
      params = [req.user.id];
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch tickets' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch ticket' });
  }
});

router.put('/:id/assign', requireAuth, requireRole('admin'), async (req, res) => {
  const { developerId } = req.body;
  try {
    await pool.query('UPDATE tickets SET assigned_to = ? WHERE id = ?', [developerId, req.params.id]);
    await pool.query(
      'INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)',
      [developerId, req.params.id, 'You have been assigned a new ticket']
    );
    res.json({ message: 'Ticket assigned' });
  } catch (err) {
    res.status(500).json({ error: 'Could not assign ticket' });
  }
});

router.put('/:id/status', requireAuth, requireRole('developer', 'admin'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['Open', 'In Progress', 'Resolved'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const [rows] = await pool.query('SELECT created_by FROM tickets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id]);
    await pool.query(
      'INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)',
      [rows[0].created_by, req.params.id, `Your ticket status changed to ${status}`]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update status' });
  }
});

module.exports = router;

const pool = require('../config/db');

exports.createNote = async (req, res) => {
  const { title, content, priority } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO notes (user_id, title, content, priority) VALUES (?, ?, ?, ?)',
      [req.user.id, title, content, priority]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      content,
      priority
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const [notes] = await pool.execute(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, priority } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE notes SET title = ?, content = ?, priority = ? WHERE id = ? AND user_id = ?',
      [title, content, priority, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

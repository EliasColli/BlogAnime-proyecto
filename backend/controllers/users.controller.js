const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

        await pool.query('DELETE FROM users WHERE email = ?', [req.params.email]);
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.changeRole = async (req, res) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

        const [user] = await pool.query('SELECT role FROM users WHERE email = ?', [req.params.email]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        const newRole = user[0].role === 'ADMIN' ? 'USER' : 'ADMIN';
        await pool.query('UPDATE users SET role = ? WHERE email = ?', [newRole, req.params.email]);
        
        res.status(200).json({ message: 'Role updated to ' + newRole });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

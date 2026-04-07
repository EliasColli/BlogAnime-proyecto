const pool = require('../config/db');

exports.getAllArticles = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const author = req.userData.name; 
        
        const [result] = await pool.query(
            'INSERT INTO articles (title, content, author, category) VALUES (?, ?, ?, ?)',
            [title, content, author, category || 'Sin Categoría']
        );
        res.status(201).json({ message: 'Article created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const [article] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (article.length === 0) return res.status(404).json({ message: 'Article not found' });
        
        // Let's assume ADMIN can delete anything, USER can delete only their own
        if (req.userData.role !== 'ADMIN' && article[0].author !== req.userData.name) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

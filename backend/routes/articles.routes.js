const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articles.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', articlesController.getAllArticles);
router.get('/:id', articlesController.getArticleById);
router.post('/', authMiddleware, articlesController.createArticle);
router.delete('/:id', authMiddleware, articlesController.deleteArticle);

module.exports = router;

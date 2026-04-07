const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, usersController.getAllUsers);
router.delete('/:email', authMiddleware, usersController.deleteUser);
router.put('/role/:email', authMiddleware, usersController.changeRole);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

router.post('/register', userController.create);
router.post('/sign-in', userController.authenticate);

module.exports = router;
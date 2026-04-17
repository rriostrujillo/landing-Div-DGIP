const express = require('express');
const router = express.Router();
const authCtrl = require('./auth.controller');

router.get('/login', authCtrl.loginPage);
router.post('/login', authCtrl.login);
router.get('/logout', authCtrl.logout);

module.exports = router;

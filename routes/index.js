const express = require('express');
const router = express.Router();

// Rota inicial
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router; 
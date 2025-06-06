const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models');

// Rota para criar o primeiro admin
router.get('/create-admin', async (req, res) => {
    try {
        // Verifica se já existe algum admin
        const result = await db.query('SELECT * FROM usuarios WHERE tipo = $1', ['admin']);
        
        if (result.rows.length > 0) {
            return res.status(400).send('Já existe um administrador cadastrado!');
        }

        // Cria o admin padrão
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)',
            ['Administrador', 'admin@barbearia.com', hashedPassword, 'admin']
        );

        res.send('Administrador criado com sucesso!<br>Email: admin@barbearia.com<br>Senha: admin123');
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        res.status(500).send('Erro ao criar administrador');
    }
});

module.exports = router; 
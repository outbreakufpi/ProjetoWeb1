const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models');
const { checkAuth } = require('../middleware/auth');

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Você precisa estar logado para acessar esta página');
    res.redirect('/auth/login');
};

// Rota de login
router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca o usuário no banco
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            req.flash('error_msg', 'Email ou senha incorretos');
            return res.redirect('/auth/login');
        }

        // Verifica a senha
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) {
            req.flash('error_msg', 'Email ou senha incorretos');
            return res.redirect('/auth/login');
        }

        // Remove a senha do objeto do usuário
        delete user.senha;

        // Salva o usuário na sessão
        req.session.user = user;
        req.flash('success_msg', 'Login realizado com sucesso!');

        // Redireciona baseado no tipo de usuário
        switch (user.tipo) {
            case 'admin':
                res.redirect('/admin/dashboard');
                break;
            case 'funcionario':
                res.redirect('/funcionario/dashboard');
                break;
            default:
                res.redirect('/cliente/dashboard');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        req.flash('error_msg', 'Erro ao realizar login');
        res.redirect('/auth/login');
    }
});

// Rota de registro
router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha } = req.body;

        // Validações
        if (senha !== confirmarSenha) {
            req.flash('error_msg', 'As senhas não coincidem');
            return res.redirect('/auth/register');
        }

        // Verifica se o email já está em uso
        const emailCheck = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            req.flash('error_msg', 'Este email já está em uso');
            return res.redirect('/auth/register');
        }

        // Cria o usuário
        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)',
            [nome, email, hashedPassword, 'cliente']
        );

        req.flash('success_msg', 'Registro realizado com sucesso! Faça login para continuar.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Erro no registro:', error);
        req.flash('error_msg', 'Erro ao realizar registro');
        res.redirect('/auth/register');
    }
});

// Rota de logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { User, Agendamento, Servico } = require('../models');
const { checkAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const bcrypt = require('bcrypt');

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado. Apenas imagens (JPEG, PNG, GIF) são permitidas.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware para verificar se é admin
router.use(checkAdmin);

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Acesso negado. Apenas administradores podem acessar esta área.');
    res.redirect('/');
};

// Dashboard do admin
router.get('/dashboard', async (req, res) => {
    try {
        // Buscar estatísticas
        const [
            totalClientes,
            totalFuncionarios,
            totalServicos,
            agendamentosHoje
        ] = await Promise.all([
            db.query('SELECT COUNT(*) FROM usuarios WHERE tipo = $1', ['cliente']),
            db.query('SELECT COUNT(*) FROM usuarios WHERE tipo = $1', ['funcionario']),
            db.query('SELECT COUNT(*) FROM servicos'),
            db.query('SELECT COUNT(*) FROM agendamentos WHERE data = CURRENT_DATE')
        ]);

        // Buscar últimos agendamentos
        const ultimosAgendamentos = await db.query(`
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data DESC, a.hora DESC
            LIMIT 5
        `);

        res.render('admin/dashboard', {
            user: req.session.user,
            totalClientes: totalClientes.rows[0].count,
            totalFuncionarios: totalFuncionarios.rows[0].count,
            totalServicos: totalServicos.rows[0].count,
            agendamentosHoje: agendamentosHoje.rows[0].count,
            ultimosAgendamentos: ultimosAgendamentos.rows
        });
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        req.flash('error_msg', 'Erro ao carregar dashboard');
        res.redirect('/');
    }
});

// Cadastro de funcionário
router.get('/funcionario/cadastrar', (req, res) => {
    res.render('admin/cadastrar-funcionario');
});

router.post('/funcionario/cadastrar', upload.single('foto'), async (req, res) => {
    const { nome, email, senha, cpf, telefone, endereco } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const userExists = await User.findOne({ where: { email } });
        
        if (userExists) {
            req.flash('error_msg', 'Email já cadastrado');
            return res.redirect('/admin/funcionario/cadastrar');
        }

        await User.create({
            nome,
            email,
            senha,
            cpf,
            telefone,
            endereco,
            foto,
            tipo: 'funcionario'
        });

        req.flash('success_msg', 'Funcionário cadastrado com sucesso!');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao cadastrar funcionário');
        res.redirect('/admin/funcionario/cadastrar');
    }
});

// Gerenciamento de serviços
router.get('/servicos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servicos ORDER BY nome');
        res.render('admin/servicos', { 
            user: req.session.user,
            servicos: result.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        req.flash('error_msg', 'Erro ao carregar serviços');
        res.redirect('/admin/dashboard');
    }
});

router.post('/servicos', async (req, res) => {
    const { nome, descricao, duracao, preco } = req.body;

    try {
        await db.query(
            'INSERT INTO servicos (nome, descricao, duracao, preco) VALUES ($1, $2, $3, $4)',
            [nome, descricao, duracao, preco]
        );

        req.flash('success_msg', 'Serviço cadastrado com sucesso!');
        res.redirect('/admin/servicos');
    } catch (error) {
        console.error('Erro ao cadastrar serviço:', error);
        req.flash('error_msg', 'Erro ao cadastrar serviço');
        res.redirect('/admin/servicos');
    }
});

// Gerenciamento de agendamentos
router.get('/agendamentos', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data DESC, a.hora DESC
        `);
        
        res.render('admin/agendamentos', { 
            user: req.session.user,
            agendamentos: result.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        req.flash('error_msg', 'Erro ao carregar agendamentos');
        res.redirect('/admin/dashboard');
    }
});

router.post('/agendamentos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query(
            'UPDATE agendamentos SET status = $1 WHERE id = $2',
            [status, id]
        );
        
        req.flash('success_msg', 'Status do agendamento atualizado com sucesso!');
        res.redirect('/admin/agendamentos');
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        req.flash('error_msg', 'Erro ao atualizar status do agendamento');
        res.redirect('/admin/agendamentos');
    }
});

// Gerenciamento de funcionários
router.get('/funcionarios', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome', ['funcionario']);
        res.render('admin/funcionarios', { 
            user: req.session.user,
            funcionarios: result.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        req.flash('error_msg', 'Erro ao carregar funcionários');
        res.redirect('/admin/dashboard');
    }
});

router.post('/funcionarios', upload.single('foto'), async (req, res) => {
    const { nome, email, senha, cpf, telefone, endereco } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Verificar se o email já existe
        const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            req.flash('error_msg', 'Email já cadastrado');
            return res.redirect('/admin/funcionarios');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Inserir novo funcionário
        await db.query(
            'INSERT INTO usuarios (nome, email, senha, cpf, telefone, endereco, foto, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [nome, email, hashedPassword, cpf, telefone, endereco, foto, 'funcionario']
        );

        req.flash('success_msg', 'Funcionário cadastrado com sucesso!');
        res.redirect('/admin/funcionarios');
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        req.flash('error_msg', 'Erro ao cadastrar funcionário');
        res.redirect('/admin/funcionarios');
    }
});

router.delete('/funcionarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM usuarios WHERE id = $1 AND tipo = $2', [id, 'funcionario']);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        res.status(500).json({ success: false, error: 'Erro ao excluir funcionário' });
    }
});

module.exports = router; 
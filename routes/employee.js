const express = require('express');
const router = express.Router();
const db = require('../models');
const { checkFuncionario } = require('../middleware/auth');

// Middleware para verificar se é funcionário
router.use(checkFuncionario);

// Dashboard do funcionário
router.get('/dashboard', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, 
                   c.nome as cliente_nome,
                   s.nome as servico_nome
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.funcionario_id = $1
            ORDER BY a.data DESC, a.hora DESC
        `, [req.session.user.id]);
        
        res.render('employee/dashboard', {
            user: req.session.user,
            agendamentos: result.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar dashboard');
        res.redirect('/');
    }
});

// Rota para visualizar agendamentos
router.get('/agendamentos', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, 
                   c.nome as cliente_nome,
                   s.nome as servico_nome
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.funcionario_id = $1
            ORDER BY a.data DESC, a.hora DESC
        `, [req.session.user.id]);
        
        res.render('employee/dashboard', {
            user: req.session.user,
            agendamentos: result.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar agendamentos');
        res.redirect('/funcionario/dashboard');
    }
});

// Criar agendamento para cliente
router.get('/agendar', async (req, res) => {
    try {
        const clientes = await db.query('SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome', ['cliente']);
        const servicos = await db.query('SELECT * FROM servicos ORDER BY nome');
        res.render('employee/agendar', { clientes: clientes.rows, servicos: servicos.rows });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar página de agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

router.post('/agendar', async (req, res) => {
    const { clienteId, servicoId, data, hora } = req.body;

    try {
        // Verificar se é horário comercial (8h às 18h) e não é horário de almoço (12h às 13h)
        const horaAgendamento = new Date(`2000-01-01T${hora}`);
        const horaInicio = new Date('2000-01-01T08:00');
        const horaFim = new Date('2000-01-01T18:00');
        const horaAlmocoInicio = new Date('2000-01-01T12:00');
        const horaAlmocoFim = new Date('2000-01-01T13:00');

        if (horaAgendamento < horaInicio || horaAgendamento > horaFim) {
            req.flash('error_msg', 'Horário fora do horário comercial');
            return res.redirect('/funcionario/agendar');
        }

        if (horaAgendamento >= horaAlmocoInicio && horaAgendamento <= horaAlmocoFim) {
            req.flash('error_msg', 'Não é possível agendar durante o horário de almoço');
            return res.redirect('/funcionario/agendar');
        }

        // Verificar se o horário está disponível
        const existente = await db.query(
            'SELECT 1 FROM agendamentos WHERE funcionario_id = $1 AND data = $2 AND hora = $3 AND status IN ($4, $5)',
            [req.session.user.id, data, hora, 'pendente', 'confirmado']
        );
        if (existente.rows.length > 0) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect('/funcionario/agendar');
        }

        // Inserir como confirmado
        await db.query(
            'INSERT INTO agendamentos (cliente_id, funcionario_id, servico_id, data, hora, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [clienteId, req.session.user.id, servicoId, data, hora, 'confirmado']
        );

        req.flash('success_msg', 'Agendamento realizado com sucesso!');
        res.redirect('/funcionario/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao realizar agendamento');
        res.redirect('/funcionario/agendar');
    }
});

// Editar agendamento
router.get('/agendamento/:id/editar', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];

        if (!agendamento || agendamento.funcionario_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/funcionario/dashboard');
        }

        const clientes = await db.query('SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome', ['cliente']);
        const servicos = await db.query('SELECT * FROM servicos ORDER BY nome');

        res.render('employee/editar-agendamento', { agendamento, clientes: clientes.rows, servicos: servicos.rows });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

router.post('/agendamento/:id/editar', async (req, res) => {
    const { clienteId, servicoId, data, hora } = req.body;

    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];

        if (!agendamento || agendamento.funcionario_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/funcionario/dashboard');
        }

        // Verificar se o horário está disponível (excluindo o próprio agendamento)
        const existente = await db.query(
            'SELECT 1 FROM agendamentos WHERE funcionario_id = $1 AND data = $2 AND hora = $3 AND status IN ($4, $5) AND id <> $6',
            [req.session.user.id, data, hora, 'pendente', 'confirmado', req.params.id]
        );
        if (existente.rows.length > 0) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect(`/funcionario/agendamento/${agendamento.id}/editar`);
        }

        await db.query(
            'UPDATE agendamentos SET cliente_id = $1, servico_id = $2, data = $3, hora = $4 WHERE id = $5',
            [clienteId, servicoId, data, hora, req.params.id]
        );

        req.flash('success_msg', 'Agendamento atualizado com sucesso!');
        res.redirect('/funcionario/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao atualizar agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

// Atualizar status do agendamento
router.post('/agendamento/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [id]);
        const agendamento = agendamentoResult.rows[0];

        if (!agendamento || agendamento.funcionario_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/funcionario/dashboard');
        }

        await db.query('UPDATE agendamentos SET status = $1 WHERE id = $2', [status, id]);

        req.flash('success_msg', 'Status do agendamento atualizado com sucesso!');
        res.redirect('/funcionario/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao atualizar status do agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

// Confirmar agendamento
router.post('/agendamento/:id/confirmar', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        
        if (!agendamento || agendamento.funcionario_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/funcionario/dashboard');
        }

        await db.query('UPDATE agendamentos SET status = $1 WHERE id = $2', ['confirmado', req.params.id]);
        req.flash('success_msg', 'Agendamento confirmado com sucesso!');
        res.redirect('/funcionario/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao confirmar agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

// Cancelar agendamento
router.post('/agendamento/:id/cancelar', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        
        if (!agendamento || agendamento.funcionario_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/funcionario/dashboard');
        }

        await db.query('UPDATE agendamentos SET status = $1 WHERE id = $2', ['cancelado', req.params.id]);
        req.flash('success_msg', 'Agendamento cancelado com sucesso!');
        res.redirect('/funcionario/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao cancelar agendamento');
        res.redirect('/funcionario/dashboard');
    }
});

module.exports = router; 
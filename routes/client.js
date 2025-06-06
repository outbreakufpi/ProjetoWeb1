const express = require('express');
const router = express.Router();
const db = require('../models');
const { checkAuth } = require('../middleware/auth');

// Middleware para verificar se é cliente
router.use(checkAuth);
router.use((req, res, next) => {
    if (req.session.user.tipo !== 'cliente') {
        req.flash('error_msg', 'Acesso não autorizado');
        return res.redirect('/');
    }
    next();
});

// Dashboard do cliente
router.get('/dashboard', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, 
                   f.nome as barbeiro_nome,
                   s.nome as servico_nome
            FROM agendamentos a
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.cliente_id = $1
            ORDER BY a.data DESC, a.hora DESC
        `, [req.session.user.id]);
        res.render('client/dashboard', {
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

// Página de agendamento
router.get('/agendar', async (req, res) => {
    try {
        const barbeiros = await db.query('SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome', ['funcionario']);
        const servicos = await db.query('SELECT * FROM servicos ORDER BY nome');
        res.render('client/agendar', {
            user: req.session.user,
            barbeiros: barbeiros.rows,
            servicos: servicos.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar página de agendamento');
        res.redirect('/cliente/dashboard');
    }
});

// Realizar agendamento
router.post('/agendar', async (req, res) => {
    const { barbeiroId, servicoId, data, hora, observacao } = req.body;
    try {
        // Verificar horário comercial primeiro
        const horaAgendamento = new Date(`2000-01-01T${hora}`);
        const horaInicio = new Date('2000-01-01T08:00');
        const horaFim = new Date('2000-01-01T18:00');
        const horaAlmocoInicio = new Date('2000-01-01T12:00');
        const horaAlmocoFim = new Date('2000-01-01T13:00');
        if (horaAgendamento < horaInicio || horaAgendamento > horaFim) {
            req.flash('error_msg', 'Horário fora do horário comercial (08:00 às 18:00)');
            return res.redirect('/cliente/agendar');
        }
        if (horaAgendamento >= horaAlmocoInicio && horaAgendamento < horaAlmocoFim) {
            req.flash('error_msg', 'Não é possível agendar durante o horário de almoço (12:00 às 13:00)');
            return res.redirect('/cliente/agendar');
        }
        // Verificar se o horário está disponível
        const agendamentoExistente = await db.query(
            'SELECT * FROM agendamentos WHERE funcionario_id = $1 AND data = $2 AND hora = $3 AND status IN ($4, $5)',
            [barbeiroId, data, hora, 'pendente', 'confirmado']
        );
        if (agendamentoExistente.rows.length > 0) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect('/cliente/agendar');
        }
        // Inserir como confirmado
        await db.query(
            'INSERT INTO agendamentos (cliente_id, funcionario_id, servico_id, data, hora, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [req.session.user.id, barbeiroId, servicoId, data, hora, 'confirmado', observacao || null]
        );
        req.flash('success_msg', 'Agendamento realizado e confirmado com sucesso!');
        res.redirect('/cliente/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao realizar agendamento');
        res.redirect('/cliente/agendar');
    }
});

// Editar agendamento
router.get('/agendamento/:id/editar', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        if (!agendamento || agendamento.cliente_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/cliente/dashboard');
        }
        const barbeiros = await db.query('SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome', ['funcionario']);
        const servicos = await db.query('SELECT * FROM servicos ORDER BY nome');
        res.render('client/editar-agendamento', {
            user: req.session.user,
            agendamento,
            barbeiros: barbeiros.rows,
            servicos: servicos.rows,
            style: null,
            script: null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar agendamento');
        res.redirect('/cliente/dashboard');
    }
});

router.post('/agendamento/:id/editar', async (req, res) => {
    const { barbeiroId, servicoId, data, hora } = req.body;
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        if (!agendamento || agendamento.cliente_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/cliente/dashboard');
        }
        // Verificar se o horário está disponível (excluindo o próprio agendamento)
        const agendamentoExistente = await db.query(
            'SELECT * FROM agendamentos WHERE funcionario_id = $1 AND data = $2 AND hora = $3 AND status IN ($4, $5) AND id <> $6',
            [barbeiroId, data, hora, 'pendente', 'confirmado', req.params.id]
        );
        if (agendamentoExistente.rows.length > 0) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect(`/cliente/agendamento/${agendamento.id}/editar`);
        }
        await db.query(
            'UPDATE agendamentos SET funcionario_id = $1, servico_id = $2, data = $3, hora = $4 WHERE id = $5',
            [barbeiroId, servicoId, data, hora, req.params.id]
        );
        req.flash('success_msg', 'Agendamento atualizado com sucesso!');
        res.redirect('/cliente/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao atualizar agendamento');
        res.redirect('/cliente/dashboard');
    }
});

// Cancelar agendamento
router.post('/agendamento/:id/cancelar', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        if (!agendamento || agendamento.cliente_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/cliente/dashboard');
        }
        await db.query('UPDATE agendamentos SET status = $1 WHERE id = $2', ['cancelado', req.params.id]);
        req.flash('success_msg', 'Agendamento cancelado com sucesso!');
        res.redirect('/cliente/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao cancelar agendamento');
        res.redirect('/cliente/dashboard');
    }
});

// Excluir agendamento (apenas se cancelado)
router.post('/agendamento/:id/excluir', async (req, res) => {
    try {
        const agendamentoResult = await db.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
        const agendamento = agendamentoResult.rows[0];
        if (!agendamento || agendamento.cliente_id !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/cliente/dashboard');
        }
        if (agendamento.status !== 'cancelado') {
            req.flash('error_msg', 'Só é possível excluir agendamentos cancelados.');
            return res.redirect('/cliente/dashboard');
        }
        await db.query('DELETE FROM agendamentos WHERE id = $1', [req.params.id]);
        req.flash('success_msg', 'Agendamento excluído com sucesso!');
        res.redirect('/cliente/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao excluir agendamento');
        res.redirect('/cliente/dashboard');
    }
});

// Rota para visualizar agendamentos
router.get('/agendamentos', async (req, res) => {
    res.redirect('/cliente/dashboard');
});

module.exports = router; 
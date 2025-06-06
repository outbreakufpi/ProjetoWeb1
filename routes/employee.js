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
        const clientes = await User.findAll({ where: { tipo: 'cliente' } });
        const servicos = await Servico.findAll();
        res.render('employee/agendar', { clientes, servicos });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar página de agendamento');
        res.redirect('/employee/dashboard');
    }
});

router.post('/agendar', async (req, res) => {
    const { clienteId, servicoId, data, hora } = req.body;

    try {
        // Verificar se o horário está disponível
        const agendamentoExistente = await Agendamento.findOne({
            where: {
                barbeiroId: req.session.user.id,
                data,
                hora,
                status: ['pendente', 'confirmado']
            }
        });

        if (agendamentoExistente) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect('/employee/agendar');
        }

        // Verificar se é horário comercial (8h às 18h) e não é horário de almoço (12h às 13h)
        const horaAgendamento = new Date(`2000-01-01T${hora}`);
        const horaInicio = new Date('2000-01-01T08:00');
        const horaFim = new Date('2000-01-01T18:00');
        const horaAlmocoInicio = new Date('2000-01-01T12:00');
        const horaAlmocoFim = new Date('2000-01-01T13:00');

        if (horaAgendamento < horaInicio || horaAgendamento > horaFim) {
            req.flash('error_msg', 'Horário fora do horário comercial');
            return res.redirect('/employee/agendar');
        }

        if (horaAgendamento >= horaAlmocoInicio && horaAgendamento <= horaAlmocoFim) {
            req.flash('error_msg', 'Não é possível agendar durante o horário de almoço');
            return res.redirect('/employee/agendar');
        }

        await Agendamento.create({
            clienteId,
            barbeiroId: req.session.user.id,
            servicoId,
            data,
            hora,
            status: 'confirmado'
        });

        req.flash('success_msg', 'Agendamento realizado com sucesso!');
        res.redirect('/employee/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao realizar agendamento');
        res.redirect('/employee/agendar');
    }
});

// Editar agendamento
router.get('/agendamento/:id/editar', async (req, res) => {
    try {
        const agendamento = await Agendamento.findByPk(req.params.id, {
            include: [
                { model: User, as: 'cliente' },
                { model: Servico }
            ]
        });

        if (!agendamento || agendamento.barbeiroId !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/employee/dashboard');
        }

        const clientes = await User.findAll({ where: { tipo: 'cliente' } });
        const servicos = await Servico.findAll();

        res.render('employee/editar-agendamento', { agendamento, clientes, servicos });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao carregar agendamento');
        res.redirect('/employee/dashboard');
    }
});

router.post('/agendamento/:id/editar', async (req, res) => {
    const { clienteId, servicoId, data, hora } = req.body;

    try {
        const agendamento = await Agendamento.findByPk(req.params.id);

        if (!agendamento || agendamento.barbeiroId !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/employee/dashboard');
        }

        // Verificar se o horário está disponível (excluindo o próprio agendamento)
        const agendamentoExistente = await Agendamento.findOne({
            where: {
                barbeiroId: req.session.user.id,
                data,
                hora,
                status: ['pendente', 'confirmado'],
                id: { [Op.ne]: agendamento.id }
            }
        });

        if (agendamentoExistente) {
            req.flash('error_msg', 'Este horário já está ocupado');
            return res.redirect(`/employee/agendamento/${agendamento.id}/editar`);
        }

        await agendamento.update({
            clienteId,
            servicoId,
            data,
            hora
        });

        req.flash('success_msg', 'Agendamento atualizado com sucesso!');
        res.redirect('/employee/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao atualizar agendamento');
        res.redirect('/employee/dashboard');
    }
});

// Atualizar status do agendamento
router.post('/agendamento/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const agendamento = await Agendamento.findByPk(id);

        if (!agendamento || agendamento.barbeiroId !== req.session.user.id) {
            req.flash('error_msg', 'Agendamento não encontrado');
            return res.redirect('/employee/dashboard');
        }

        await agendamento.update({ status });

        req.flash('success_msg', 'Status do agendamento atualizado com sucesso!');
        res.redirect('/employee/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao atualizar status do agendamento');
        res.redirect('/employee/dashboard');
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
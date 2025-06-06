class Appointment {
    constructor(db) {
        this.db = db;
    }

    async create(appointmentData) {
        const { cliente_id, funcionario_id, servico_id, data, hora, observacao } = appointmentData;
        const query = `
            INSERT INTO agendamentos (cliente_id, funcionario_id, servico_id, data, hora, status, observacao)
            VALUES ($1, $2, $3, $4, $5, 'pendente', $6)
            RETURNING *
        `;
        const values = [cliente_id, funcionario_id, servico_id, data, hora, observacao];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome,
                   s.duracao as servico_duracao,
                   s.preco as servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.id = $1
        `;
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, appointmentData) {
        const { data, hora, status, observacao } = appointmentData;
        const query = `
            UPDATE agendamentos 
            SET data = $1, hora = $2, status = $3, observacao = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [data, hora, status, observacao, id];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async updateStatus(id, status) {
        const query = `
            UPDATE agendamentos 
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.db.query(query, [status, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM agendamentos WHERE id = $1 RETURNING *';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async findByClient(cliente_id) {
        const query = `
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome,
                   s.duracao as servico_duracao,
                   s.preco as servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.cliente_id = $1
            ORDER BY a.data DESC, a.hora DESC
        `;
        const result = await this.db.query(query, [cliente_id]);
        return result.rows;
    }

    async findByEmployee(funcionario_id) {
        const query = `
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome,
                   s.duracao as servico_duracao,
                   s.preco as servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.funcionario_id = $1
            ORDER BY a.data DESC, a.hora DESC
        `;
        const result = await this.db.query(query, [funcionario_id]);
        return result.rows;
    }

    async findAll() {
        const query = `
            SELECT a.*, 
                   c.nome as cliente_nome,
                   f.nome as funcionario_nome,
                   s.nome as servico_nome,
                   s.duracao as servico_duracao,
                   s.preco as servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN usuarios f ON a.funcionario_id = f.id
            JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data DESC, a.hora DESC
        `;
        const result = await this.db.query(query);
        return result.rows;
    }

    async checkAvailability(funcionario_id, data, hora) {
        const query = `
            SELECT COUNT(*) as count
            FROM agendamentos
            WHERE funcionario_id = $1 
            AND data = $2 
            AND hora = $3
            AND status != 'cancelado'
        `;
        const result = await this.db.query(query, [funcionario_id, data, hora]);
        return result.rows[0].count === '0';
    }
}

module.exports = Appointment; 
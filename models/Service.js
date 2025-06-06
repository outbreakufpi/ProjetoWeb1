class Service {
    constructor(db) {
        this.db = db;
    }

    async create(serviceData) {
        const { nome, descricao, duracao, preco } = serviceData;
        const query = `
            INSERT INTO servicos (nome, descricao, duracao, preco)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [nome, descricao, duracao, preco];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = 'SELECT * FROM servicos WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, serviceData) {
        const { nome, descricao, duracao, preco } = serviceData;
        const query = `
            UPDATE servicos 
            SET nome = $1, descricao = $2, duracao = $3, preco = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [nome, descricao, duracao, preco, id];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM servicos WHERE id = $1 RETURNING *';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = 'SELECT * FROM servicos ORDER BY nome';
        const result = await this.db.query(query);
        return result.rows;
    }
}

module.exports = Service; 
const bcrypt = require('bcrypt');

class User {
    constructor(db) {
        this.db = db;
    }

    async create(userData) {
        const { nome, email, senha, cpf, telefone, endereco, tipo } = userData;
        const hashedPassword = await bcrypt.hash(senha, 10);

        const query = `
            INSERT INTO usuarios (nome, email, senha, cpf, telefone, endereco, tipo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [nome, email, hashedPassword, cpf, telefone, endereco, tipo];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async findByEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await this.db.query(query, [email]);
        return result.rows[0];
    }

    async findById(id) {
        const query = 'SELECT * FROM usuarios WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, userData) {
        const { nome, email, telefone, endereco } = userData;
        const query = `
            UPDATE usuarios 
            SET nome = $1, email = $2, telefone = $3, endereco = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [nome, email, telefone, endereco, id];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = `
            UPDATE usuarios 
            SET senha = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.db.query(query, [hashedPassword, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = 'SELECT * FROM usuarios ORDER BY nome';
        const result = await this.db.query(query);
        return result.rows;
    }

    async findByType(tipo) {
        const query = 'SELECT * FROM usuarios WHERE tipo = $1 ORDER BY nome';
        const result = await this.db.query(query, [tipo]);
        return result.rows;
    }

    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 
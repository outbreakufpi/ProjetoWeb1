require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function updateAdmin() {
    try {
        // Gerar hash da senha
        const senha = 'admin123';
        const hashedPassword = await bcrypt.hash(senha, 10);
        
        // Atualizar o administrador
        const result = await pool.query(
            `UPDATE usuarios 
             SET senha = $1 
             WHERE email = $2 
             RETURNING id, nome, email, tipo`,
            [hashedPassword, 'admin@barbearia.com']
        );

        if (result.rows.length === 0) {
            // Se não existir, criar novo
            await pool.query(
                `INSERT INTO usuarios (nome, email, senha, tipo) 
                 VALUES ($1, $2, $3, $4)`,
                ['Administrador', 'admin@barbearia.com', hashedPassword, 'admin']
            );
            console.log('Administrador criado com sucesso!');
        } else {
            console.log('Senha do administrador atualizada com sucesso!');
        }

        console.log('Credenciais:');
        console.log('Email: admin@barbearia.com');
        console.log('Senha: admin123');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        pool.end();
    }
}

updateAdmin(); 
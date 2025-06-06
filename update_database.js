const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updateDatabase() {
    try {
        // Lê o arquivo SQL
        const sqlFile = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Executa o script SQL
        await pool.query(sql);
        console.log('Banco de dados atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar banco de dados:', error);
    } finally {
        await pool.end();
    }
}

updateDatabase(); 
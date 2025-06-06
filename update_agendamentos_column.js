const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addObservacoesColumn() {
    try {
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='agendamentos' AND column_name='observacoes'
                ) THEN
                    ALTER TABLE agendamentos ADD COLUMN observacoes TEXT;
                END IF;
            END$$;
        `);
        console.log('Coluna observacoes garantida na tabela agendamentos!');
    } catch (error) {
        console.error('Erro ao adicionar coluna observacoes:', error);
    } finally {
        await pool.end();
    }
}

addObservacoesColumn(); 
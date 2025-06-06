const { Pool } = require('pg');
const User = require('./User');
const Service = require('./Service');
const Appointment = require('./Appointment');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Testa a conexão
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
});

const db = {
    query: (text, params) => pool.query(text, params),
    user: new User(pool),
    service: new Service(pool),
    appointment: new Appointment(pool)
};

module.exports = db; 
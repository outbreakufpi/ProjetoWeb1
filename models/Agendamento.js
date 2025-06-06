const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agendamento = sequelize.define('Agendamento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    servico: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'concluido'),
        defaultValue: 'pendente'
    },
    observacao: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Agendamento; 
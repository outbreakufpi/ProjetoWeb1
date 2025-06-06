-- Criação do banco de dados
CREATE DATABASE barbearia;

-- Conectar ao banco de dados
\c barbearia;

-- Criação das tabelas
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'funcionario', 'cliente')),
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    endereco TEXT,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao INTEGER NOT NULL, -- duração em minutos
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id),
    funcionario_id INTEGER REFERENCES usuarios(id),
    servico_id INTEGER REFERENCES servicos(id),
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar o updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
    BEFORE UPDATE ON servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir o administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo, cpf, telefone, endereco)
VALUES (
    'Administrador',
    'admin@barbearia.com',
    '$2b$10$igDGJQpmWkEvQIBCM4B8DeGuFZQ/ioaTkupm9enfEIbZb4tUKw78K',
    'admin',
    '123.456.789-00',
    '(11) 99999-9999',
    'Endereço do Administrador'
) ON CONFLICT (email) DO NOTHING;

-- Inserir alguns serviços padrão
INSERT INTO servicos (nome, descricao, duracao, preco)
VALUES 
    ('Corte de Cabelo', 'Corte tradicional masculino', 30, 35.00),
    ('Barba', 'Aparar e modelar barba', 20, 25.00),
    ('Corte + Barba', 'Pacote completo de corte e barba', 45, 55.00)
ON CONFLICT DO NOTHING; 
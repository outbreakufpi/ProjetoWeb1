# Sistema de Barbearia 

Um sistema completo para gerenciamento de barbearia, desenvolvido com Node.js, Express e PostgreSQL.

## 🚀 Funcionalidades

- **Agendamentos**: Marque horários para cortes e barbas
- **Gestão de Clientes**: Cadastro e histórico de clientes
- **Gestão de Funcionários**: Controle de barbeiros e serviços
- **Serviços**: Cadastro de diferentes tipos de cortes e preços
- **Painel Administrativo**: Controle total do sistema

## 🛠️ Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- EJS (Templates)
- Bootstrap
- bcrypt (Segurança)

## 📋 Pré-requisitos

- Node.js instalado
- PostgreSQL instalado
- pgAdmin 4 (recomendado para gerenciar o banco de dados)

## 🔧 Instalação

1. Clone este repositório:
```bash
git clone https://github.com/outbreakufpi/ProjetoWeb1
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
   - Abra o pgAdmin 4
   - Crie um novo banco de dados chamado "barbearia"
   - Abra o Query Tool (F3)
   - Abra o arquivo `init_database.sql`
   - Execute o arquivo (F5)

4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     # Windows (PowerShell)
     Copy-Item .env.example .env
     
     # Linux/Mac
     cp .env.example .env
     ```
   - Edite o arquivo `.env` e configure suas credenciais:
     ```env
     # Database Configuration
     DB_USER=postgres
     DB_HOST=localhost
     DB_NAME=barbearia
     DB_PASSWORD=sua_senha_do_postgres_aqui
     DB_PORT=5432
     
     # Session Configuration (IMPORTANTE: gere uma chave aleatória segura)
     SESSION_SECRET=gere_uma_chave_aleatoria_segura_aqui
     
     # Application Configuration
     NODE_ENV=development
     PORT=3001
     ```
   
   ⚠️ **IMPORTANTE**:
   - `DB_PASSWORD` deve ser uma string (entre aspas se contiver caracteres especiais)
   - `SESSION_SECRET` deve ser uma string aleatória longa (mínimo 32 caracteres)
   - Para gerar um `SESSION_SECRET` seguro, use:
     ```bash
     # Node.js
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **NUNCA** commit o arquivo `.env` no repositório (já está no `.gitignore`)

5. Inicie o servidor:
```bash
npm start
```

## 👤 Acesso Inicial

Após a instalação, você pode acessar o sistema com as seguintes credenciais:

- **Email**: admin@barbearia.com
- **Senha**: admin123

⚠️ **Importante**: Altere a senha do administrador após o primeiro acesso!

## 📱 Uso do Sistema

### Para Clientes
- Faça seu cadastro
- Agende horários
- Veja seu histórico de cortes
- Gerencie seu perfil

### Para Funcionários
- Visualize agenda do dia
- Gerencie seus serviços
- Atualize status dos agendamentos

### Para Administradores
- Gerencie usuários
- Configure serviços e preços
- Acompanhe relatórios
- Controle financeiro

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação por sessão
- Controle de acesso por níveis
- Proteção contra injeção SQL

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se precisar de ajuda ou encontrar algum problema:
- Abra uma issue no GitHub
- Entre em contato com a equipe de suporte

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- A todos os contribuidores
- À comunidade open source
- Aos usuários que testam e reportam problemas 

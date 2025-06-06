# Sistema de Barbearia 🪒

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
git clone [URL_DO_REPOSITÓRIO]
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
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
```
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=barbearia
```

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
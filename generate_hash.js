const bcrypt = require('bcrypt');

const senha = 'admin123';
bcrypt.hash(senha, 10, function(err, hash) {
    if (err) {
        console.error('Erro ao gerar hash:', err);
        return;
    }
    console.log('Hash gerado:', hash);
    console.log('\nUse este hash no arquivo init_database.sql substituindo $2b$10$YourHashedPasswordHere');
}); 
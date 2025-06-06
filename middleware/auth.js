const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error_msg', 'Você precisa estar logado para acessar esta página');
        return res.redirect('/login');
    }
    next();
};

const checkAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.tipo !== 'admin') {
        req.flash('error_msg', 'Você não tem permissão para acessar esta página');
        return res.redirect('/');
    }
    next();
};

const checkFuncionario = (req, res, next) => {
    if (!req.session.user || (req.session.user.tipo !== 'funcionario' && req.session.user.tipo !== 'admin')) {
        req.flash('error_msg', 'Você não tem permissão para acessar esta página');
        return res.redirect('/');
    }
    next();
};

module.exports = {
    checkAuth,
    checkAdmin,
    checkFuncionario
}; 
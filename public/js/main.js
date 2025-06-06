// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Função para formatar hora
function formatarHora(hora) {
    return hora.substring(0, 5);
}

// Função para formatar preço
function formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(preco);
}

// Função para formatar CPF
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para validar data (não permitir datas passadas)
function validarData(input) {
    const data = new Date(input.value);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (data < hoje) {
        input.setCustomValidity('Não é possível selecionar uma data passada');
    } else {
        input.setCustomValidity('');
    }
}

// Função para validar horário (não permitir horário de almoço)
function validarHorario(input) {
    const hora = input.value;
    const [horas, minutos] = hora.split(':').map(Number);

    if (horas === 12 && minutos >= 0 && minutos <= 59) {
        input.setCustomValidity('Não é possível agendar durante o horário de almoço (12:00 às 13:00)');
    } else {
        input.setCustomValidity('');
    }
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto > 9 ? 0 : resto;
    
    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto > 9 ? 0 : resto;
    
    return digitoVerificador2 === parseInt(cpf.charAt(10));
}

// Função para validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para validar formulários
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const cpfInput = form.querySelector('input[name="cpf"]');
            const emailInput = form.querySelector('input[name="email"]');
            
            if (cpfInput && !validarCPF(cpfInput.value)) {
                event.preventDefault();
                alert('CPF inválido');
                return;
            }
            
            if (emailInput && !validarEmail(emailInput.value)) {
                event.preventDefault();
                alert('Email inválido');
                return;
            }
        });
    });
});

// Função para confirmar exclusão
function confirmarExclusao(mensagem = 'Tem certeza que deseja excluir este item?') {
    return confirm(mensagem);
}

// Função para mostrar mensagens de erro
function mostrarErro(mensagem) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Função para mostrar mensagens de sucesso
function mostrarSucesso(mensagem) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Função para mostrar/esconder senha
function toggleSenha(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Função para inicializar tooltips do Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 
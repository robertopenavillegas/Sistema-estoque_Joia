function loadAddProductPage(content) {
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-plus me-3"></i>Adicionar Produto</h1>
            <p>Cadastre novos produtos no estoque</p>
        </div>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-box me-2"></i>Dados do Produto</h5>
                    </div>
                    <div class="card-body">
                        <form id="addProductForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="productName" class="form-label">Nome do Produto *</label>
                                    <input type="text" class="form-control" id="productName" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="productCategory" class="form-label">Categoria *</label>
                                    <select class="form-select" id="productCategory" required>
                                        <option value="">Selecione uma categoria</option>
                                        <option value="Bebida">Bebida</option>
                                        <option value="Doce">Doce</option>
                                        <option value="Salgadinho">Salgadinho</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="productSupplier" class="form-label">Fornecedor *</label>
                                    <input type="text" class="form-control" id="productSupplier" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="productExpiry" class="form-label">Data de Validade *</label>
                                    <input type="date" class="form-control" id="productExpiry" required>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="productQuantity" class="form-label">Quantidade *</label>
                                    <input type="number" class="form-control" id="productQuantity" min="1" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="productValue" class="form-label">Valor Unitário (R$) *</label>
                                    <input type="number" class="form-control" id="productValue" step="0.01" min="0" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="productObservation" class="form-label">Observação (opcional)</label>
                                <textarea class="form-control" id="productObservation" rows="3" placeholder="Informações adicionais sobre o produto"></textarea>
                            </div>

                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button type="button" class="btn btn-secondary me-md-2" onclick="loadPage('index')">
                                    <i class="fas fa-arrow-left me-2"></i>Voltar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Salvar Produto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('addProductForm').addEventListener('submit', handleProductSubmit);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const supplier = document.getElementById('productSupplier').value.trim();
    const expiry = document.getElementById('productExpiry').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const value = parseFloat(document.getElementById('productValue').value);
    const observation = document.getElementById('productObservation').value.trim();

    if (!validateProductForm(name, category, supplier, expiry, quantity, value)) {
        return;
    }

    // Desabilitar botão de submit durante o processamento
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';

    const newProduct = {
        name,
        category,
        supplier,
        expiry,
        quantity,
        value
    };

    // Salvar produto no banco de dados
    const result = await stockManager.saveProduct(newProduct);

    if (result.success) {
        // Adicionar histórico de entrada
        const historyObservation = observation || `Entrada inicial do produto ${name}`;
        await stockManager.addHistory(
            result.id, 
            'entry', 
            quantity, 
            historyObservation,
            0,
            quantity
        );

        showSuccessMessage('Produto adicionado com sucesso!');

        setTimeout(() => {
            loadPage('index');
        }, 1500);
    } else {
        showErrorMessage(result.message || 'Erro ao adicionar produto.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Produto';
    }
}

function validateProductForm(name, category, supplier, expiry, quantity, value) {
    if (!name) {
        showErrorMessage('O nome do produto é obrigatório.');
        return false;
    }

    if (!category) {
        showErrorMessage('Por favor, selecione uma categoria.');
        return false;
    }

    if (!supplier) {
        showErrorMessage('O fornecedor é obrigatório.');
        return false;
    }

    if (!expiry) {
        showErrorMessage('A data de validade é obrigatória.');
        return false;
    }

    const expiryDate = new Date(expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expiryDate < today) {
        showErrorMessage('A data de validade não pode ser anterior à data atual.');
        return false;
    }

    if (!quantity || quantity < 1) {
        showErrorMessage('A quantidade deve ser maior que zero.');
        return false;
    }

    if (!value || value <= 0) {
        showErrorMessage('O valor deve ser maior que zero.');
        return false;
    }

    return true;
}

function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}
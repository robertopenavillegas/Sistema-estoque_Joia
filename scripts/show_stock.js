async function loadShowStockPage(content) {
    // Recarregar produtos do banco antes de exibir
    await stockManager.loadProducts();
    
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-list me-3"></i>Estoque</h1>
            <p>Visualize e gerencie todos os produtos</p>
        </div>

        <div class="filters-card">
            <div class="row align-items-end">
                <div class="col-md-3">
                    <label for="categoryFilter" class="form-label">Filtrar por Categoria</label>
                    <select class="form-select" id="categoryFilter">
                        <option value="">Todas as categorias</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Doce">Doce</option>
                        <option value="Salgadinho">Salgadinho</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="expiryFilter" class="form-label">Filtrar por Validade</label>
                    <select class="form-select" id="expiryFilter">
                        <option value="">Todos os produtos</option>
                        <option value="7">Vencem em 7 dias</option>
                        <option value="30">Vencem em 30 dias</option>
                        <option value="expired">Já vencidos</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="searchFilter" class="form-label">Buscar Produto</label>
                    <input type="text" class="form-control" id="searchFilter" placeholder="Nome do produto...">
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-secondary w-100" onclick="loadPage('index')">
                        <i class="fas fa-arrow-left me-2"></i>Voltar
                    </button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div id="stockTable">
                    ${generateStockTable()}
                </div>
            </div>
        </div>
    `;

    document.getElementById('categoryFilter').addEventListener('change', filterStock);
    document.getElementById('expiryFilter').addEventListener('change', filterStock);
    document.getElementById('searchFilter').addEventListener('input', filterStock);
}

function generateStockTable(filteredProducts = null) {
    const products = filteredProducts || stockManager.products;

    if (products.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>Nenhum produto encontrado</h4>
                <p>Não há produtos que correspondam aos filtros selecionados.</p>
            </div>
        `;
    }

    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Fornecedor</th>
                        <th>Quantidade</th>
                        <th>Valor Unit.</th>
                        <th>Valor Total</th>
                        <th>Validade</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    products.forEach(product => {
        const totalValue = (product.quantity * product.value).toFixed(2);
        const expiryDate = new Date(product.expiry);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = '';
        let expiryBadge = 'bg-success';
        let statusText = 'Normal';
        
        if (daysUntilExpiry < 0) {
            expiryClass = 'expired';
            expiryBadge = 'bg-danger';
            statusText = 'Vencido';
        } else if (daysUntilExpiry <= 7) {
            expiryClass = 'expiring-soon';
            expiryBadge = 'bg-warning';
            statusText = 'Vencendo';
        }

        const stockClass = product.quantity < 10 ? 'text-warning' : '';

        tableHTML += `
            <tr class="${expiryClass}">
                <td><strong>${product.name}</strong></td>
                <td><span class="badge bg-primary">${product.category}</span></td>
                <td>${product.supplier}</td>
                <td>
                    <span class="badge bg-info ${stockClass}">
                        ${product.quantity}
                        ${product.quantity < 10 ? ' <i class="fas fa-exclamation-triangle"></i>' : ''}
                    </span>
                </td>
                <td>R$ ${product.value.toFixed(2)}</td>
                <td><strong>R$ ${totalValue}</strong></td>
                <td>
                    <span class="badge ${expiryBadge}">
                        ${new Date(product.expiry).toLocaleDateString('pt-BR')}
                    </span>
                </td>
                <td><span class="badge ${expiryBadge}">${statusText}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="showProductHistory(${product.id})" title="Ver Histórico">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="showAdjustStockModal(${product.id})" title="Ajustar Estoque">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${product.id})" title="Remover Produto">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <p class="text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Mostrando ${products.length} produto(s) de ${stockManager.products.length} total
                </p>
            </div>
            <div class="col-md-6 text-end">
                <p class="text-muted">
                    <i class="fas fa-chart-bar me-2"></i>
                    Valor total exibido: R$ ${products.reduce((sum, p) => sum + (p.quantity * p.value), 0).toFixed(2)}
                </p>
            </div>
        </div>
    `;

    return tableHTML;
}

async function filterStock() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const expiryFilter = document.getElementById('expiryFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

    let filteredProducts = stockManager.products;

    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }

    
    if (searchFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchFilter) ||
            product.supplier.toLowerCase().includes(searchFilter)
        );
    }

    
    if (expiryFilter) {
        if (expiryFilter === 'expired') {
            filteredProducts = filteredProducts.filter(product => {
                const expiryDate = new Date(product.expiry);
                return expiryDate < new Date();
            });
        } else {
            const days = parseInt(expiryFilter);
           
            const expiringProducts = await stockManager.getExpiringProducts(days);
            
            
            const expiringIds = expiringProducts.map(p => p.id);
            filteredProducts = filteredProducts.filter(p => expiringIds.includes(p.id));
        }
    }

    document.getElementById('stockTable').innerHTML = generateStockTable(filteredProducts);
}

async function showProductHistory(productId) {
    const product = stockManager.products.find(p => p.id === productId);
    if (!product) return;

    
    const result = await window.api.history.getByProduct(productId);
    const productHistory = result.success ? result.history : [];
    
    let historyHTML = `
        <div class="mb-3">
            <h6><i class="fas fa-box me-2"></i>${product.name}</h6>
            <p class="text-muted">Histórico completo de movimentações</p>
        </div>
    `;

    if (productHistory.length === 0) {
        historyHTML += `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h5>Nenhuma movimentação encontrada</h5>
                <p>Este produto ainda não possui histórico de movimentações.</p>
            </div>
        `;
    } else {
        
        productHistory.sort((a, b) => b.id - a.id);
        
        productHistory.forEach(entry => {
            
            const date = new Date(entry.id || Date.now()).toLocaleString('pt-BR');
            const typeText = entry.type === 'entry' ? 'Entrada' : entry.type === 'exit' ? 'Saída' : 'Ajuste';
            const typeClass = `history-${entry.type}`;

            historyHTML += `
                <div class="history-item ${typeClass}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${typeText}</strong> - ${entry.quantity} unidades
                            ${entry.observation ? `<br><small class="text-muted">${entry.observation}</small>` : ''}
                            ${entry.previousQuantity !== null ? `<br><small class="text-muted">Anterior: ${entry.previousQuantity} → Novo: ${entry.newQuantity}</small>` : ''}
                        </div>
                        <small class="text-muted">${date}</small>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('historyContent').innerHTML = historyHTML;
    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}

function showAdjustStockModal(productId) {
    const product = stockManager.products.find(p => p.id === productId);
    if (!product) return;

    const modalHTML = `
        <div class="modal fade" id="adjustStockModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-edit me-2"></i>
                            Ajustar Estoque - ${product.name}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <p><strong>Estoque atual:</strong> ${product.quantity} unidades</p>
                        </div>
                        <div class="mb-3">
                            <label for="adjustmentType" class="form-label">Tipo de Ajuste</label>
                            <select class="form-select" id="adjustmentType">
                                <option value="entry">Entrada (Adicionar ao estoque)</option>
                                <option value="exit">Saída (Remover do estoque)</option>
                                <option value="adjustment">Ajuste (Definir quantidade exata)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="adjustmentQuantity" class="form-label">Quantidade</label>
                            <input type="number" class="form-control" id="adjustmentQuantity" min="1" required>
                        </div>
                        <div class="mb-3">
                            <label for="adjustmentObservation" class="form-label">Observação</label>
                            <textarea class="form-control" id="adjustmentObservation" rows="3" placeholder="Motivo do ajuste..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="executeStockAdjustment(${productId})">
                            <i class="fas fa-save me-2"></i>Salvar Ajuste
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('adjustStockModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('adjustStockModal'));
    modal.show();

    document.getElementById('adjustStockModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function executeStockAdjustment(productId) {
    const product = stockManager.products.find(p => p.id === productId);
    if (!product) return;

    const adjustmentType = document.getElementById('adjustmentType').value;
    const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
    const observation = document.getElementById('adjustmentObservation').value.trim();

    if (!quantity || quantity <= 0) {
        alert('Por favor, informe uma quantidade válida.');
        return;
    }

    const previousQuantity = product.quantity;
    let newQuantity = previousQuantity;
    let historyQuantity = quantity;

    switch (adjustmentType) {
        case 'entry':
            newQuantity = previousQuantity + quantity;
            break;
        case 'exit':
            newQuantity = previousQuantity - quantity;
            if (newQuantity < 0) {
                alert('Não é possível remover mais itens do que o estoque atual.');
                return;
            }
            break;
        case 'adjustment':
            newQuantity = quantity;
            historyQuantity = Math.abs(quantity - previousQuantity);
            break;
    }

    
    const updateResult = await stockManager.updateProductQuantity(productId, newQuantity);
    
    if (!updateResult.success) {
        alert('Erro ao atualizar estoque: ' + updateResult.message);
        return;
    }

   
    const historyObservation = observation || `Ajuste de estoque: ${adjustmentType === 'entry' ? 'Entrada' : adjustmentType === 'exit' ? 'Saída' : 'Ajuste'}`;
    await stockManager.addHistory(
        productId, 
        adjustmentType, 
        historyQuantity, 
        historyObservation,
        previousQuantity,
        newQuantity
    );

    
    const modal = bootstrap.Modal.getInstance(document.getElementById('adjustStockModal'));
    modal.hide();

    
    await filterStock();

    showSuccessMessage(`Estoque ajustado com sucesso! Nova quantidade: ${newQuantity}`);
}

async function removeProduct(productId) {
    if (!confirm('Tem certeza que deseja remover este produto do estoque?')) {
        return;
    }

    const product = stockManager.products.find(p => p.id === productId);
    if (!product) return;

   
    await stockManager.addHistory(
        productId, 
        'exit', 
        product.quantity, 
        `Produto removido do sistema: ${product.name}`,
        product.quantity,
        0
    );
    
    
    const result = await stockManager.deleteProduct(productId);
    
    if (result.success) {
        
        await filterStock();
        showSuccessMessage('Produto removido com sucesso!');
    } else {
        alert('Erro ao remover produto: ' + result.message);
    }
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
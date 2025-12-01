async function loadIndexPage(content) {
    
    await stockManager.loadProducts();
    await stockManager.loadHistory();
    
    const totalProducts = stockManager.products.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = stockManager.products.reduce((sum, product) => sum + (product.quantity * product.value), 0);
    
    
    const expiringProducts = await stockManager.getExpiringProducts(7);
    const expiringCount = expiringProducts.length;

    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-home me-3"></i>Painel Principal</h1>
            <p>Gerencie seu estoque de forma eficiente</p>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="stats-card">
                    <div class="stats-number">${totalProducts}</div>
                    <div class="stats-label">Total de Produtos</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <div class="stats-number">R$ ${totalValue.toFixed(2)}</div>
                    <div class="stats-label">Valor Total do Estoque</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card ${expiringCount > 0 ? 'text-warning' : ''}">
                    <div class="stats-number">${expiringCount}</div>
                    <div class="stats-label">Produtos Vencendo</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <a href="#" onclick="loadPage('add_product')" class="action-button">
                    <i class="fas fa-plus"></i>
                    <div>Adicionar Produto</div>
                    <small>Cadastrar novos itens no estoque</small>
                </a>
            </div>
            <div class="col-md-4">
                <a href="#" onclick="loadPage('show_stock')" class="action-button">
                    <i class="fas fa-list"></i>
                    <div>Visualizar Estoque</div>
                    <small>Ver todos os produtos cadastrados</small>
                </a>
            </div>
            <div class="col-md-4">
                <a href="#" onclick="generateMonthlyReport()" class="action-button">
                    <i class="fas fa-file-download"></i>
                    <div>Relatório Mensal</div>
                    <small>Gerar relatório de movimentações</small>
                </a>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-line me-2"></i>Resumo do Estoque</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Produtos por Categoria</h6>
                                ${getCategoryStats()}
                            </div>
                            <div class="col-md-6">
                                <h6>Últimas Movimentações</h6>
                                ${getRecentHistory()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCategoryStats() {
    const categories = {};
    stockManager.products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category] += product.quantity;
    });

    let html = '';
    Object.entries(categories).forEach(([category, quantity]) => {
        html += `
            <div class="d-flex justify-content-between mb-2">
                <span>${category}</span>
                <span class="badge bg-primary">${quantity}</span>
            </div>
        `;
    });

    return html || '<p class="text-muted">Nenhum produto cadastrado</p>';
}

function getRecentHistory() {
    
    const recentHistory = [...stockManager.history]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
    
    let html = '';

    recentHistory.forEach(entry => {
        
        const date = new Date(entry.id || Date.now()).toLocaleDateString('pt-BR');
        const typeIcon = entry.type === 'entry' ? 'plus' : entry.type === 'exit' ? 'minus' : 'edit';
        const typeColor = entry.type === 'entry' ? 'success' : entry.type === 'exit' ? 'danger' : 'warning';

        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <i class="fas fa-${typeIcon} text-${typeColor} me-2"></i>
                    <small>${entry.productName} - ${entry.quantity} unidades</small>
                </div>
                <small class="text-muted">${date}</small>
            </div>
        `;
    });

    return html || '<p class="text-muted">Nenhuma movimentação registrada</p>';
}

async function generateMonthlyReport() {
    
    await stockManager.loadHistory();
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    
    const monthlyHistory = stockManager.history.filter(entry => {
       
        const entryDate = new Date(entry.id || Date.now());
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    if (monthlyHistory.length === 0) {
        alert('Não há movimentações registradas neste mês para gerar o relatório.');
        return;
    }

    const csvContent = stockManager.generateCSVReport(monthlyHistory);
    stockManager.downloadCSV(csvContent, `relatorio_estoque_${currentYear}_${(currentMonth + 1).toString().padStart(2, '0')}.csv`);
}
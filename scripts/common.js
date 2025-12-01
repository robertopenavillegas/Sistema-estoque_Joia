class StockManager {
    constructor() {
        this.products = [];
        this.history = [];
        this.init();
    }

    
    async init() {
        await this.loadProducts();
        await this.loadHistory();
    }

    // Carregar produtos do banco de dados
    async loadProducts() {
        try {
            const result = await window.api.product.getAll();
            if (result.success) {
                this.products = result.products;
                console.log('✓ Produtos carregados:', this.products.length);
            } else {
                console.error('Erro ao carregar produtos:', result.message);
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Carregar histórico do banco de dados
    async loadHistory() {
        try {
            const result = await window.api.history.getAll();
            if (result.success) {
                this.history = result.history;
                console.log('✓ Histórico carregado:', this.history.length);
            } else {
                console.error('Erro ao carregar histórico:', result.message);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    }

    // Salvar produto no banco
    async saveProduct(productData) {
        try {
            const result = await window.api.product.create(productData);
            if (result.success) {
                await this.loadProducts();
                console.log('✓ Produto salvo com sucesso! ID:', result.id);
            }
            return result;
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            return { success: false, message: error.message };
        }
    }

    // Adicionar histórico
    async addHistory(productId, type, quantity, observation = '', previousQuantity = null, newQuantity = null) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Produto não encontrado');
            return { success: false, message: 'Produto não encontrado' };
        }

        const historyData = {
            productId: productId,
            productName: product.name,
            type: type,
            quantity: quantity,
            previousQuantity: previousQuantity,
            newQuantity: newQuantity,
            observation: observation
        };

        try {
            const result = await window.api.history.add(historyData);
            if (result.success) {
                await this.loadHistory();
                console.log('✓ Histórico registrado com sucesso!');
            }
            return result;
        } catch (error) {
            console.error('Erro ao adicionar histórico:', error);
            return { success: false, message: error.message };
        }
    }

    // Atualizar produto
    async updateProduct(id, productData) {
        try {
            const result = await window.api.product.update(id, productData);
            if (result.success) {
                await this.loadProducts();
                console.log('✓ Produto atualizado com sucesso!');
            }
            return result;
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            return { success: false, message: error.message };
        }
    }

    // Deletar produto
    async deleteProduct(id) {
        try {
            const result = await window.api.product.delete(id);
            if (result.success) {
                await this.loadProducts();
                console.log('✓ Produto deletado com sucesso!');
            }
            return result;
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            return { success: false, message: error.message };
        }
    }

    // Atualizar quantidade
    async updateProductQuantity(id, quantity) {
        try {
            const result = await window.api.product.updateQuantity(id, quantity);
            if (result.success) {
                await this.loadProducts();
                console.log('✓ Quantidade atualizada com sucesso!');
            }
            return result;
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            return { success: false, message: error.message };
        }
    }

    // Buscar produtos vencendo
    async getExpiringProducts(days) {
        try {
            const result = await window.api.product.getExpiring(days);
            if (result.success) {
                return result.products;
            } else {
                console.error('Erro ao buscar produtos vencendo:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Erro ao buscar produtos vencendo:', error);
            return [];
        }
    }

    // Gerar relatório CSV
    generateCSVReport(history) {
        const headers = ['ID', 'Data/Hora', 'Produto', 'Tipo', 'Quantidade', 'Observação'];
        let csvContent = headers.join(';') + '\n';

        history.forEach(entry => {
            
            const date = new Date(entry.id).toLocaleString('pt-BR');
            const type = entry.type === 'entry' ? 'Entrada' : entry.type === 'exit' ? 'Saída' : 'Ajuste';
            const row = [
                entry.id,
                `"${date}"`,
                `"${entry.productName}"`,
                `"${type}"`,
                entry.quantity,
                `"${entry.observation || ''}"`
            ];
            csvContent += row.join(';') + '\n';
        });

        return csvContent;
    }

    // Download CSV
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Relatório gerado e baixado com sucesso!');
        } else {
            alert('Seu navegador não suporta o download automático. Por favor, copie o conteúdo do relatório.');
        }
    }
}

let stockManager;

async function loadPage(pageName) {
    const content = document.getElementById('page-content');

    
    content.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-3 text-muted">Carregando dados...</p>
        </div>
    `;

    try {
        switch (pageName) {
            case 'index':
                await loadIndexPage(content);
                break;
            case 'add_product':
                loadAddProductPage(content);
                break;
            case 'show_stock':
                await loadShowStockPage(content);
                break;
            default:
                await loadIndexPage(content);
        }
    } catch (error) {
        console.error('Erro ao carregar página:', error);
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Erro ao carregar página:</strong> ${error.message}
            </div>
        `;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando aplicação...');
    
    try {
        stockManager = new StockManager();
        
        
        await stockManager.init();
        
        console.log('✓ Aplicação pronta!');
        
        
        await loadPage('index');
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle me-2"></i>Erro de Conexão</h4>
                <p>Não foi possível conectar ao banco de dados.</p>
                <p class="mb-0"><small>Verifique se o MySQL está rodando e se as credenciais estão corretas.</small></p>
                <hr>
                <p class="mb-0"><strong>Erro:</strong> ${error.message}</p>
            </div>
        `;
    }
});
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('path');
const { testConnection } = require('./backend/config/database');
const productService = require('./backend/models/productService');
const historyService = require('./backend/models/historyService');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile("index.html");
  
  // Abrir DevTools em desenvolvimento (descomente se necessário)
  // mainWindow.webContents.openDevTools();
}

// Testar conexão com o banco ao iniciar
app.whenReady().then(async () => {
  await testConnection();
  createWindow();
  setupIpcHandlers();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Configurar handlers IPC
function setupIpcHandlers() {
  
  // ============ PRODUTOS ============
  
  // Criar produto
  ipcMain.handle('product:create', async (event, productData) => {
    return await productService.createProduct(productData);
  });

  // Listar todos os produtos
  ipcMain.handle('product:getAll', async () => {
    return await productService.getAllProducts();
  });

  // Buscar produto por ID
  ipcMain.handle('product:getById', async (event, id) => {
    return await productService.getProductById(id);
  });

  // Atualizar produto
  ipcMain.handle('product:update', async (event, id, productData) => {
    return await productService.updateProduct(id, productData);
  });

  // Deletar produto
  ipcMain.handle('product:delete', async (event, id) => {
    return await productService.deleteProduct(id);
  });

  // Atualizar quantidade
  ipcMain.handle('product:updateQuantity', async (event, id, quantity) => {
    return await productService.updateProductQuantity(id, quantity);
  });

  // Buscar produtos vencendo
  ipcMain.handle('product:getExpiring', async (event, days) => {
    return await productService.getExpiringProducts(days);
  });

  // ============ HISTÓRICO ============

  // Adicionar histórico
  ipcMain.handle('history:add', async (event, historyData) => {
    return await historyService.addHistory(historyData);
  });

  // Buscar todo histórico
  ipcMain.handle('history:getAll', async () => {
    return await historyService.getAllHistory();
  });

  // Buscar histórico por produto
  ipcMain.handle('history:getByProduct', async (event, productId) => {
    return await historyService.getHistoryByProduct(productId);
  });

  // Buscar histórico por período
  ipcMain.handle('history:getByDateRange', async (event, startDate, endDate) => {
    return await historyService.getHistoryByDateRange(startDate, endDate);
  });

  // Buscar histórico por tipo
  ipcMain.handle('history:getByType', async (event, type) => {
    return await historyService.getHistoryByType(type);
  });
}
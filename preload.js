const { contextBridge, ipcRenderer } = require('electron');

// Expor API segura para o renderer (scripts frontend)
contextBridge.exposeInMainWorld('api', {
  
  // ============ PRODUTOS ============
  product: {
    create: (productData) => ipcRenderer.invoke('product:create', productData),
    getAll: () => ipcRenderer.invoke('product:getAll'),
    getById: (id) => ipcRenderer.invoke('product:getById', id),
    update: (id, productData) => ipcRenderer.invoke('product:update', id, productData),
    delete: (id) => ipcRenderer.invoke('product:delete', id),
    updateQuantity: (id, quantity) => ipcRenderer.invoke('product:updateQuantity', id, quantity),
    getExpiring: (days) => ipcRenderer.invoke('product:getExpiring', days)
  },

  // ============ HISTÓRICO ============
  history: {
    add: (historyData) => ipcRenderer.invoke('history:add', historyData),
    getAll: () => ipcRenderer.invoke('history:getAll'),
    getByProduct: (productId) => ipcRenderer.invoke('history:getByProduct', productId),
    getByDateRange: (startDate, endDate) => ipcRenderer.invoke('history:getByDateRange', startDate, endDate),
    getByType: (type) => ipcRenderer.invoke('history:getByType', type)
  }
});
const { query } = require('../config/database');

// Adicionar entrada no histórico
async function addHistory(historyData) {
  const sql = `
    INSERT INTO history (productId, productName, type, quantity, previousQuantity, newQuantity, observation, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    historyData.productId,
    historyData.productName,
    historyData.type,
    historyData.quantity,
    historyData.previousQuantity || null,
    historyData.newQuantity || null,
    historyData.observation || null,
    historyData.userId || null
  ];

  try {
    const result = await query(sql, params);
    return {
      success: true,
      id: result.insertId,
      message: 'Histórico registrado com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao adicionar histórico:', error);
    return {
      success: false,
      message: 'Erro ao adicionar histórico: ' + error.message
    };
  }
}

// Buscar todo o histórico
async function getAllHistory() {
  const sql = `
    SELECT h.*, p.name as productName 
    FROM history h
    LEFT JOIN product p ON h.productId = p.id
    ORDER BY h.id DESC
  `;
  
  try {
    const history = await query(sql);
    return {
      success: true,
      history: history
    };
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return {
      success: false,
      message: 'Erro ao buscar histórico: ' + error.message,
      history: []
    };
  }
}

// Buscar histórico por produto
async function getHistoryByProduct(productId) {
  const sql = `
    SELECT * FROM history 
    WHERE productId = ?
    ORDER BY id DESC
  `;
  
  try {
    const history = await query(sql, [productId]);
    return {
      success: true,
      history: history
    };
  } catch (error) {
    console.error('Erro ao buscar histórico do produto:', error);
    return {
      success: false,
      message: 'Erro ao buscar histórico: ' + error.message,
      history: []
    };
  }
}

// Buscar histórico por período
async function getHistoryByDateRange(startDate, endDate) {
  const sql = `
    SELECT h.*, p.name as productName 
    FROM history h
    LEFT JOIN product p ON h.productId = p.id
    WHERE DATE(h.id) BETWEEN ? AND ?
    ORDER BY h.id DESC
  `;
  
  try {
    const history = await query(sql, [startDate, endDate]);
    return {
      success: true,
      history: history
    };
  } catch (error) {
    console.error('Erro ao buscar histórico por período:', error);
    return {
      success: false,
      message: 'Erro ao buscar histórico: ' + error.message,
      history: []
    };
  }
}

// Buscar histórico por tipo
async function getHistoryByType(type) {
  const sql = `
    SELECT h.*, p.name as productName 
    FROM history h
    LEFT JOIN product p ON h.productId = p.id
    WHERE h.type = ?
    ORDER BY h.id DESC
  `;
  
  try {
    const history = await query(sql, [type]);
    return {
      success: true,
      history: history
    };
  } catch (error) {
    console.error('Erro ao buscar histórico por tipo:', error);
    return {
      success: false,
      message: 'Erro ao buscar histórico: ' + error.message,
      history: []
    };
  }
}

module.exports = {
  addHistory,
  getAllHistory,
  getHistoryByProduct,
  getHistoryByDateRange,
  getHistoryByType
};
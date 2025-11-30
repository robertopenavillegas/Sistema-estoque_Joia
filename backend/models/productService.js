const { query } = require('../config/database');

// Criar produto
async function createProduct(productData) {
  const sql = `
    INSERT INTO product (name, category, supplier, expiry, quantity, value, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `;
  
  const params = [
    productData.name,
    productData.category,
    productData.supplier,
    productData.expiry,
    productData.quantity,
    productData.value
  ];

  try {
    const result = await query(sql, params);
    return {
      success: true,
      id: result.insertId,
      message: 'Produto criado com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return {
      success: false,
      message: 'Erro ao criar produto: ' + error.message
    };
  }
}

// Listar todos os produtos
async function getAllProducts() {
  const sql = 'SELECT * FROM product WHERE status = "active" ORDER BY id DESC';
  
  try {
    const products = await query(sql);
    return {
      success: true,
      products: products
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return {
      success: false,
      message: 'Erro ao buscar produtos: ' + error.message,
      products: []
    };
  }
}

// Buscar produto por ID
async function getProductById(id) {
  const sql = 'SELECT * FROM product WHERE id = ?';
  
  try {
    const products = await query(sql, [id]);
    if (products.length > 0) {
      return {
        success: true,
        product: products[0]
      };
    } else {
      return {
        success: false,
        message: 'Produto não encontrado'
      };
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return {
      success: false,
      message: 'Erro ao buscar produto: ' + error.message
    };
  }
}

// Atualizar produto
async function updateProduct(id, productData) {
  const sql = `
    UPDATE product 
    SET name = ?, category = ?, supplier = ?, expiry = ?, quantity = ?, value = ?
    WHERE id = ?
  `;
  
  const params = [
    productData.name,
    productData.category,
    productData.supplier,
    productData.expiry,
    productData.quantity,
    productData.value,
    id
  ];

  try {
    const result = await query(sql, params);
    if (result.affectedRows > 0) {
      return {
        success: true,
        message: 'Produto atualizado com sucesso!'
      };
    } else {
      return {
        success: false,
        message: 'Produto não encontrado'
      };
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return {
      success: false,
      message: 'Erro ao atualizar produto: ' + error.message
    };
  }
}

// Deletar produto (soft delete)
async function deleteProduct(id) {
  const sql = 'UPDATE product SET status = "inactive" WHERE id = ?';
  
  try {
    const result = await query(sql, [id]);
    if (result.affectedRows > 0) {
      return {
        success: true,
        message: 'Produto deletado com sucesso!'
      };
    } else {
      return {
        success: false,
        message: 'Produto não encontrado'
      };
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return {
      success: false,
      message: 'Erro ao deletar produto: ' + error.message
    };
  }
}

// Atualizar quantidade do produto
async function updateProductQuantity(id, quantity) {
  const sql = 'UPDATE product SET quantity = ? WHERE id = ?';
  
  try {
    const result = await query(sql, [quantity, id]);
    if (result.affectedRows > 0) {
      return {
        success: true,
        message: 'Quantidade atualizada com sucesso!'
      };
    } else {
      return {
        success: false,
        message: 'Produto não encontrado'
      };
    }
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    return {
      success: false,
      message: 'Erro ao atualizar quantidade: ' + error.message
    };
  }
}

// Buscar produtos próximos do vencimento
async function getExpiringProducts(days) {
  const sql = `
    SELECT * FROM product 
    WHERE status = 'active' 
    AND expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY expiry ASC
  `;
  
  try {
    const products = await query(sql, [days]);
    return {
      success: true,
      products: products
    };
  } catch (error) {
    console.error('Erro ao buscar produtos vencendo:', error);
    return {
      success: false,
      message: 'Erro ao buscar produtos: ' + error.message,
      products: []
    };
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
  getExpiringProducts
};
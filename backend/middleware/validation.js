const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required()
    .messages({
      'string.empty': 'Nome do produto é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome não pode ter mais de 255 caracteres'
    }),
  category: Joi.string().valid('Bebida', 'Doce', 'Salgadinho').required()
    .messages({
      'any.only': 'Categoria deve ser: Bebida, Doce ou Salgadinho'
    }),
  supplier: Joi.string().min(2).max(255).required()
    .messages({
      'string.empty': 'Fornecedor é obrigatório',
      'string.min': 'Fornecedor deve ter pelo menos 2 caracteres',
      'string.max': 'Fornecedor não pode ter mais de 255 caracteres'
    }),
  expiry: Joi.date().iso().min('now').required()
    .messages({
      'date.base': 'Data de validade deve ser uma data válida',
      'date.min': 'Data de validade não pode ser anterior à data atual'
    }),
  quantity: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Quantidade deve ser um número',
      'number.integer': 'Quantidade deve ser um número inteiro',
      'number.min': 'Quantidade não pode ser negativa'
    }),
  value: Joi.number().positive().precision(2).required()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser maior que zero'
    })
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  category: Joi.string().valid('Bebida', 'Doce', 'Salgadinho'),
  supplier: Joi.string().min(2).max(255),
  expiry: Joi.date().iso().min('now'),
  quantity: Joi.number().integer().min(0),
  value: Joi.number().positive().precision(2),
  status: Joi.string().valid('active', 'inactive')
}).min(1);

const historySchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  type: Joi.string().valid('entry', 'exit', 'adjustment').required(),
  quantity: Joi.number().integer().required(),
  observation: Joi.string().max(1000).allow('')
});

const adjustStockSchema = Joi.object({
  type: Joi.string().valid('entry', 'exit', 'adjustment').required(),
  quantity: Joi.number().integer().positive().required(),
  observation: Joi.string().max(1000).allow('')
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().valid('Bebida', 'Doce', 'Salgadinho'),
  status: Joi.string().valid('active', 'inactive'),
  expiring: Joi.number().integer().min(1),
  search: Joi.string().max(255),
  sortBy: Joi.string().valid('name', 'category', 'expiry', 'quantity', 'value', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  next();
};

const validateUpdateProduct = (req, res, next) => {
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  next();
};

const validateHistory = (req, res, next) => {
  const { error } = historySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  next();
};

const validateAdjustStock = (req, res, next) => {
  const { error } = adjustStockSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  next();
};

const validateQuery = (req, res, next) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  req.query = value;
  next();
};

module.exports = {
  validateProduct,
  validateUpdateProduct,
  validateHistory,
  validateAdjustStock,
  validateQuery
};
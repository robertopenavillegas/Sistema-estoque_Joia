require('dotenv').config();
const { Product, History } = require('../models');

const sampleProducts = [
  { name: 'Coca-Cola 2L', category: 'Bebida', supplier: 'Coca-Cola Brasil', expiry: '2025-12-15', quantity: 50, value: 8.50 },
  { name: 'Arroz Tio João 5kg', category: 'Mercearia', supplier: 'Tio João', expiry: '2026-06-30', quantity: 25, value: 25.90 },
  { name: 'Detergente Ypê 500ml', category: 'Produto de Limpeza', supplier: 'Ypê', expiry: '2025-09-25', quantity: 15, value: 3.25 },
  { name: 'Feijão Camil 1kg', category: 'Mercearia', supplier: 'Camil', expiry: '2026-03-15', quantity: 40, value: 8.90 },
  { name: 'Cerveja Skol 350ml', category: 'Bebida', supplier: 'Ambev', expiry: '2025-09-30', quantity: 60, value: 3.50 },
  { name: 'Sabão OMO 2kg', category: 'Produto de Limpeza', supplier: 'Unilever', expiry: '2026-05-30', quantity: 12, value: 18.90 }
];

async function seedDatabase() {
  try {
    console.log('🌱 Populando banco de dados...');

    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      console.log(`⚠️  Já existem ${existingProducts} produtos no banco.`);
      console.log('Continuando...');
    }

    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ where: { name: productData.name } });
      
      if (existingProduct) {
        console.log(`⏭️  "${productData.name}" já existe, pulando...`);
        continue;
      }

      const product = await Product.create(productData);
      
      await History.create({
        productId: product.id,
        productName: product.name,
        type: 'entry',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        observation: 'Entrada inicial - produto cadastrado'
      });

      console.log(`✅ "${product.name}" criado com sucesso!`);
    }

    const totalProducts = await Product.count();
    const totalHistory = await History.count();
    
    console.log(`\n📊 Total de produtos: ${totalProducts}`);
    console.log(`📊 Total de movimentações: ${totalHistory}`);
    console.log('✅ População concluída!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    console.log('🗑️  Limpando banco de dados...');
    
    await History.destroy({ where: {} });
    await Product.destroy({ where: {} });
    
    console.log('✅ Banco limpo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    process.exit(1);
  }
}

const command = process.argv[2];

switch (command) {
  case 'run':
    seedDatabase();
    break;
  case 'clear':
    clearDatabase();
    break;
  default:
    console.log(`
🌱 Comandos disponíveis:
  node scripts/seed.js run    - Popular com dados de exemplo
  node scripts/seed.js clear  - Limpar dados (CUIDADO!)
`);
    process.exit(1);
}
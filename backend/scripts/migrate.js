require('dotenv').config();
const db = require('../config/database');
const { Product, History } = require('../models');

async function createTables() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await db.authenticate();
    console.log('✅ Conexão estabelecida!');

    console.log('🔄 Criando tabelas...');
    await db.sync({ force: false });
    console.log('✅ Tabelas criadas com sucesso!');

    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

async function dropTables() {
  try {
    console.log('🔄 Recriando tabelas...');
    await db.sync({ force: true });
    console.log('✅ Tabelas recriadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao recriar tabelas:', error);
    process.exit(1);
  }
}

const command = process.argv[2];

switch (command) {
  case 'create':
    createTables();
    break;
  case 'reset':
    dropTables();
    break;
  default:
    console.log(`
📚 Comandos disponíveis:
  node scripts/migrate.js create  - Criar tabelas
  node scripts/migrate.js reset   - Recriar tabelas (REMOVE DADOS!)
`);
    process.exit(1);
}
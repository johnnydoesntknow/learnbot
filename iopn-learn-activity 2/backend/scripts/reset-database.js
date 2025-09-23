// backend/scripts/reset-database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete all data in the database!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'iopn_learn';
    
    console.log(`🗑️  Dropping database '${dbName}'...`);
    await connection.execute(`DROP DATABASE IF EXISTS ${dbName}`);
    
    console.log(`✨ Recreating database '${dbName}'...`);
    await connection.execute(`CREATE DATABASE ${dbName}`);
    
    console.log('✅ Database reset complete!');
    console.log('Run "npm run db:setup --seed" to recreate schema and load test data');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run reset
resetDatabase();
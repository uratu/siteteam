import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp'
});

async function addColumn() {
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    const result = await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_pause_times JSONB DEFAULT '[]'::jsonb;
    `);
    
    console.log('Column added successfully');
    await client.release();
    await pool.end();
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

addColumn(); 
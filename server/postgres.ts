
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();

export const pool = new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: connectionString
    ? { rejectUnauthorized: true }
    : undefined,
});

pool.on('error', (error) => {
  console.error(
    '[PostgreSQL] Idle connection error:',
    error.message
  );
});

export async function testDatabaseConnection(): Promise<boolean> {
  if (!connectionString) {
    console.error(
      '[PostgreSQL] DATABASE_URL is not configured.'
    );
    return false;
  }

  try {
    const result = await pool.query(
      'SELECT NOW() AS server_time, current_database() AS database_name'
    );

    console.log(
      '[PostgreSQL] Connected successfully to database:',
      result.rows[0].database_name
    );

    return true;
  } catch (error) {
    console.error(
      '[PostgreSQL] Connection failed:',
      error instanceof Error ? error.message : String(error)
    );

    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}

import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 9000,
  database: 'FirstTest',
});

export default pool;

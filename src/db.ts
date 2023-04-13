import { Pool } from 'pg';
import config from './config';

const pool = new Pool({
  user: config.dbUser,
  password: config.dbPassword,
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbDatabase,
});

export default pool;

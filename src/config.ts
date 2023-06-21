import 'dotenv/config';

import Joi from 'joi';

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test')
    .default('development'),
  TOKEN_EXPIRY_TIME: Joi.number().default(3600),
  PORT: Joi.number().default(5000),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('30m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),

  API_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  CLIENT_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:root@localhost:5432/FirstTest?schema=public',
  ),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  console.error(new Error(`Config validation error: ${error.message}`));
  process.exit(1);
}

const config = {
  nodeEnv: envVars.NODE_ENV,
  tokenExpiryTime: envVars.TOKEN_EXPIRY_TIME,
  port: envVars.PORT,
  jwtAccessSecret: envVars.JWT_ACCESS_SECRET,
  jwtRefreshSecret: envVars.JWT_REFRESH_SECRET,
  jwtAccessExpireIn: envVars.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpireIn: envVars.JWT_REFRESH_EXPIRES_IN,
  smtpHost: envVars.SMTP_HOST,
  smtpPort: envVars.SMTP_PORT,
  smtpUser: envVars.SMTP_USER,
  smtpPassword: envVars.SMTP_PASSWORD,
  dbUser: envVars.DB_USER,
  dbPassword: envVars.DB_PASSWORD,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbName: envVars.DB_NAME,
  apiUrl: envVars.API_URL,
  clientUrl: envVars.CLIENT_URL,
  databaseUrl: envVars.DATABASE_URL,
};

export default config;

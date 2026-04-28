import { z } from 'zod';

const requiredString = z.string().trim().min(1);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // general
  SERVER_PORT: z.coerce.number().int().positive(),
  SERVER_URL: z.url(),
  CLIENT_URL: z.url(),
  DOMAIN: requiredString,

  // jwt
  JWT_ISSUER: requiredString,
  JWT_SECRET: requiredString,
  JWT_EXPIRE: requiredString,

  // mysql
  MYSQL_USERNAME: requiredString,
  MYSQL_PASSWORD: requiredString,
  MYSQL_DATABASE: requiredString,
  MYSQL_HOST: requiredString,
  MYSQL_PORT: z.coerce.number().int().positive(),
});

export const validateEnvvars = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${message}`);
  }

  const env = result.data;

  return {
    // general
    env: env.NODE_ENV,
    serverPort: env.SERVER_PORT,
    serverUrl: (path = '') => `${env.SERVER_URL}${path}`,
    clientUrl: (path = '') => `${env.CLIENT_URL}${path}`,
    domain: env.DOMAIN,

    // jwt
    jwtIssuer: env.JWT_ISSUER,
    jwtSecret: env.JWT_SECRET,
    jwtExpire: env.JWT_EXPIRE,

    // mysql
    mysqlUsername: env.MYSQL_USERNAME,
    mysqlPassword: env.MYSQL_PASSWORD,
    mysqlDatabase: env.MYSQL_DATABASE,
    mysqlHost: env.MYSQL_HOST,
    mysqlPort: env.MYSQL_PORT,
  };
};

const envvars = validateEnvvars();

export default envvars;

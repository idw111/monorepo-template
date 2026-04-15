const envvars = {
  // general
  env: process.env.NODE_ENV ?? 'development',
  serverPort: Number(process.env.SERVER_PORT),
  serverUrl: (path = '') => `${process.env.SERVER_URL}${path}`,
  clientUrl: (path = '') => `${process.env.CLIENT_URL}${path}`,
  domain: process.env.DOMAIN,

  // jwt
  jwtIssuer: process.env.JWT_ISSUER,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,

  // mysql
  mysqlUsername: process.env.MYSQL_USERNAME,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDatabase: process.env.MYSQL_DATABASE,
  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: Number(process.env.MYSQL_PORT),

  // ncloud
  ncloudAccessKey: process.env.NCLOUD_ACCESS_KEY,
  ncloudAccessSecret: process.env.NCLOUD_ACCESS_SECRET,
  ncloudServiceId: process.env.NCLOUD_SERVICE_ID,
  kakaoChannel: process.env.KAKAO_CHANNEL,
};

export default envvars;

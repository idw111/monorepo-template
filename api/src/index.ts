import http from 'http';
import { initLogger, logger } from '@/utils/logger';

let server: http.Server | null = null;
let closeDatabase: (() => Promise<void>) | null = null;
let isShuttingDown = false;

const listen = (server: http.Server, port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });
};

const closeServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!server?.listening) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const shutdown = async (reason: string, exitCode = 0): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger().info('- shutting down api server... %s', reason);

  try {
    await closeServer();
    await closeDatabase?.();
    logger().info('- api server shutdown complete');
    process.exit(exitCode);
  } catch (err) {
    logger().error(err, '- api server shutdown failed');
    process.exit(1);
  }
};

const run = async () => {
  // envvars 먼저 로드 → logger 초기화 → 나머지 모듈 로드
  const { default: envvars } = await import('@/configs/envvars');
  initLogger({ isDev: envvars.env !== 'production' });

  const [{ default: app }, { connect }] = await Promise.all([import('@/configs/app'), import('@/database/mysql')]);

  // database
  const sequelize = await connect();
  closeDatabase = () => sequelize.close();

  // web server
  server = http.createServer(app);
  await listen(server, envvars.serverPort);
  logger().info('- http server started... %s', envvars.serverUrl());
};

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger().error(reason, '- unhandled promise rejection');
  void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  logger().error(err, '- uncaught exception');
  void shutdown('uncaughtException', 1);
});

run().catch((err) => {
  logger().error(err, '- failed to start api server');
  void shutdown('startup failure', 1);
});

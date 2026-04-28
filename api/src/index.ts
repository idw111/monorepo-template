import http from 'http';

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

  console.log('- shutting down api server...', reason);

  try {
    await closeServer();
    await closeDatabase?.();
    console.log('- api server shutdown complete');
    process.exit(exitCode);
  } catch (err) {
    console.error('- api server shutdown failed');
    console.error(err);
    process.exit(1);
  }
};

const run = async () => {
  const [{ default: app }, { default: envvars }, { connect }] = await Promise.all([
    import('@/configs/app'),
    import('@/configs/envvars'),
    import('@/database/mysql'),
  ]);

  // database
  const sequelize = await connect();
  closeDatabase = () => sequelize.close();

  // web server
  server = http.createServer(app);
  await listen(server, envvars.serverPort);
  console.log('- http server started...', envvars.serverUrl());
};

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  console.error('- unhandled promise rejection');
  console.error(reason);
  void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  console.error('- uncaught exception');
  console.error(err);
  void shutdown('uncaughtException', 1);
});

run().catch((err) => {
  console.error('- failed to start api server');
  console.error(err);
  void shutdown('startup failure', 1);
});

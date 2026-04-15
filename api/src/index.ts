import http from 'http';

import app from '@/configs/app';
import envvars from '@/configs/envvars';
import { connect } from '@/database/mysql';

const run = async () => {
  // database
  await connect();

  // web server
  const server = http.createServer(app);
  server.listen(envvars.serverPort);
  console.log('- http server started...', envvars.serverUrl());
};

run();

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import envvars from '@/configs/envvars';
import routes from '@/routes';
import { handleNotFound, handleRenderError, handleReportError } from '@/utils/error';

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(cors({ origin: [envvars.clientUrl()], credentials: true }));
app.set('trust proxy', 1);

// router
app.use('/', routes);

// error handler
app.use(handleNotFound);
app.use(handleReportError);
app.use(handleRenderError);

export default app;

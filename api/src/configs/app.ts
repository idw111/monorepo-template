import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import envvars from '@/configs/envvars';
import routes from '@/routes/v1';
import { handleNotFound, handleRenderError, handleReportError } from '@/utils/error';
import { getHttpLogger } from '@/utils/logger';
import { csrfProtection } from '@/utils/middleware';

const app = express();

app.use(helmet());
app.use(getHttpLogger());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(cors({ origin: [envvars.clientUrl()], credentials: true }));
app.use(csrfProtection);
app.set('trust proxy', 1);

// router
app.use('/v1', routes);

// error handler
app.use(handleNotFound);
app.use(handleReportError);
app.use(handleRenderError);

export default app;

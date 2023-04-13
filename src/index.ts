import express from 'express';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import {
  auth,
  authors,
  postR,
  users,
  drafts,
  comments,
  categories,
  tags,
} from './routes';
import { errorMiddleware, loggerMiddleware } from './middleware';
import HttpStatuses from './shared/HttpStatuses';
import Tables from './database/Tables';
import specification from './config/specification';
import db from './db';
import config from './config';

const app = express();
const { port } = config;

const apiVersion = '/api/v1';
(async () => {
  await new Tables(db).init();
})();

const jsonBodyMiddleware = express.json();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification));

// Middleware
app.use(jsonBodyMiddleware);
app.use(cookieParser());
app.use(fileUpload({}));
app.use('/static', express.static(path.resolve(__dirname, '..', 'static')));
app.use(cors({ credentials: true }));

// Routs
app.use(apiVersion, auth);
app.use(apiVersion, authors);
app.use(apiVersion, postR);
app.use(apiVersion, users);
app.use(apiVersion, drafts);
app.use(apiVersion, comments);
app.use(apiVersion, categories);
app.use(apiVersion, tags);

app.get('*', (_, res) => {
  res.status(HttpStatuses.NOT_FOUND).send('Not Found');
});

// Middleware
app.use(loggerMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`This app listening on port ${port}`);
});

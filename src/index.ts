import express from 'express';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';

import {
  auth,
  authors,
  postR,
  users,
  drafts,
  comments,
  categories,
  tags,
} from './router';
import { errorMiddleware, loggerMiddleware } from './middleware';
import HttpStatuses from './shared/HttpStatuses';

const app = express();
const port = process.env.PORT || 5000;

const apiVersion = '/api/v1';
const jsonBodyMiddleware = express.json();

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

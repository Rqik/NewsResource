import express from 'express';
import cookieParser from 'cookie-parser';
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

const app = express();
const port = process.env.PORT || 5000;

const apiVersion = '/api/v1';
const jsonBodyMiddleware = express.json();

// Middleware
app.use(jsonBodyMiddleware);
app.use(cookieParser());
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
  res.sendStatus(404);
});

// Middleware
app.use(loggerMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`This app listening on port ${port}`);
});

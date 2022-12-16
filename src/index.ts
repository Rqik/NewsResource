import express from 'express';
import {
  authors,
  postR,
  users,
  drafts,
  comments,
  categories,
  tags,
} from './router';

const app = express();
const port = process.env.PORT || 5000;
const basePath = '/api/v1';
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.use(basePath, authors);
app.use(basePath, postR);
app.use(basePath, users);
app.use(basePath, drafts);
app.use(basePath, comments);
app.use(basePath, categories);
app.use(basePath, tags);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

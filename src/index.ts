import express from 'express';
import {
  authors,
  newsR,
  users,
  drafts,
  comments,
  categories,
  tags,
} from './router';

const app = express();
const port = process.env.PORT || 5000;

const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.use('/api', authors);
app.use('/api', newsR);
app.use('/api', users);
app.use('/api', drafts);
app.use('/api', comments);
app.use('/api', categories);
app.use('/api', tags);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import express from 'express';
import HttpStatuses from './HttpStatuses';

const app = express();
const port = process.env.PORT || 5000;

const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.get('/news', (req, res) => {
  res.send('get news 2223');
});

app.post('/authors', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.status(HttpStatuses.CREATED_201).send('create author');
  } else {
    res.send('No access rights');
  }
});

app.get('/authors/:id', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.send('get author');
  } else {
    res.send('No access rights');
  }
});

app.put('/authors/:id', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.send('update author');
  } else {
    res.send('No access rights');
  }
});

app.delete('/authors/:id', (req, res) => {
  const isAdmin = false;

  if (isAdmin) {
    res.send('delete author');
  } else {
    res.send('No access rights');
  }
});

app.get('/users', (req, res) => {
  res.send('get users');
});

app.get('/categories', (req, res) => {
  res.send('create news');
});

app.get('/drafts', (req, res) => {
  res.send('create news');
});

app.get('/comments', (req, res) => {
  res.send('create news');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

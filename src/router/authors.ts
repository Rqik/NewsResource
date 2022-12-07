import express from 'express';
import HttpStatuses from '../HttpStatuses';

const router = express.Router();

router.post('/authors', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.status(HttpStatuses.CREATED_201).send('create author');
  } else {
    res.send('No access rights');
  }
});

router.get('/authors/:id', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.send('get author');
  } else {
    res.send('No access rights');
  }
});

router.put('/authors/:id', (req, res) => {
  const isAdmin = false;
  if (isAdmin) {
    res.send('update author');
  } else {
    res.send('No access rights');
  }
});

router.delete('/authors/:id', (req, res) => {
  const isAdmin = false;

  if (isAdmin) {
    res.send('delete author');
  } else {
    res.send('No access rights');
  }
});

export default router;

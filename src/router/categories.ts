import express from 'express';

const router = express.Router();

router.get('/categories', (req, res) => {
  res.send('create news');
});

export default router;

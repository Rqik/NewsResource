import express from 'express';

const router = express.Router();

router.get('/news', (req, res) => {
  res.send('get news 2223');
});

export default router;

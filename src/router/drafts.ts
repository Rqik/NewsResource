import express from 'express';

const router = express.Router();

router.get('/drafts', (req, res) => {
  res.send('create news');
});

export default router;

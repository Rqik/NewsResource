import express from 'express';

const router = express.Router();

router.get('/comments', (req, res) => {
  res.send('create comments');
});

export default router;

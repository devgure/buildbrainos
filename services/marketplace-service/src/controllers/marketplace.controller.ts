import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.get('/bids', async (_req, res) => {
  try {
    const bids = await prisma.bid.findMany();
    res.json(bids);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bids', async (req, res) => {
  const { title, budget, source } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const b = await prisma.bid.create({ data: { title, budget: budget || null, source: source || null } });
    res.status(201).json(b);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bids/:id', async (req, res) => {
  try {
    const b = await prisma.bid.findUnique({ where: { id: req.params.id } });
    if (!b) return res.status(404).json({ error: 'not found' });
    res.json(b);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const { name, address, ownerId } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const p = await prisma.project.create({ data: { name, address: address || '', ownerId } });
    res.status(201).json(p);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'not found' });
    res.json(p);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

// routes/message.ts
import express, { Request, Response } from 'express';
import Message from '../models/message';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  if(!req.body.name || !req.body.messages) return res.status(400).json({ error: 'Name and message are required' });

  try {
    const { name, messages } = req.body;
    const newMessage = new Message({ name, messages });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Mongoose Schema
const messageSchema = new mongoose.Schema({
  name: String,
  messages: String,
});
const Message = mongoose.model('Message', messageSchema);

// Initialize Express
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/messages', async (req: Request, res: Response) => {
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

app.get('/messages', async (req: Request, res: Response) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

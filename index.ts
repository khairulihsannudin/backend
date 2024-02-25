import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Message from './app/models/message';
import messageRouter from './app/routes/message';
import questionRouter from './app/routes/questions';

dotenv.config();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



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

app.use('/messages', messageRouter);
app.use('/questions', questionRouter);


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

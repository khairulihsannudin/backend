import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import messageRouter from './routes/message';
import questionRouter from './routes/questions';
import userRouter from './routes/user'; // Import the userRouter module
import eventRouter from './routes/events';
import passport from 'passport';
import { initializePassport } from './middlewares/passport';

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
app.use(passport.initialize());
initializePassport();
app.use(cors({origin: '*'}));
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/messages', messageRouter);
app.use('/questions', questionRouter);
app.use('/users', userRouter); // Add the userRouter module
app.use('/events', eventRouter)


// Error handler
app.all('*', (req: Request, res: Response) => {
  res.status(405).send({ error: 'Method Not Allowed' });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
import express, { Request, Response } from 'express';
import Question from '../models/questions';
import authenticate from '../middlewares/authenticate';

const router = express.Router();

// Belom bisa karena belum ada proses autentikasi
router.post('/', authenticate, async (req: Request, res: Response) => {
  if(!req.body.questionText || !req.body.answerOptions || !req.body.correctAnswer) return res.status(400).json({ error: 'Question text, answer options, and correct answer are required' });

  try {
    const { questionText, answerOptions, correctAnswer } = req.body;
    const newQuestion = new Question({ questionText, answerOptions, correctAnswer });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

//GET all /questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

//POST /questions/answer
//koreksi semua jawaban
router.post('/answer', async (req: Request, res: Response) => {
  try {
    if (!req.body.answer) return res.status(400).json({ error: 'Answer is required' });
    const questions = await Question.find();
    let correctAnswers = 0;
    //Ga kepikiran cara yang lebih efektif
    questions.forEach((question,index) => {
      if (req.body.answer[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    res.status(200).json({ correctAnswers, totalQuestions: questions.length });
    
    }
    catch (error:any) {
        res.status(500).json({ error: error.message });
    }
}
);

//Dynamic route harus di bawah route yang lain

//GET /questions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json(question);
    }
    catch (error:any) {
        res.status(500).json({ error: error.message });
        }
    }
);


//POST /questions/:id/answer
router.post('/:id/answer', async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    if (req.body.answer === question.correctAnswer) {
      res.status(200).json({ correct: true });
    } else {
      res.status(200).json({ correct: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});



export default router;
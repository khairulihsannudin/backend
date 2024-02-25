// models/questions.ts
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: String,
  answerOptions: [String],
  correctAnswer: String,
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
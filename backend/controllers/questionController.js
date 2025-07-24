
import models from '../db.js';
const Question = models.questionModel;
const Quiz = models.quizModel;
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params; 
    const { questionText, type, options, correctAnswer, quizId } = req.body; // quizId to ensure ownership

    // Basic validation
    if (!id || !questionText || !type || !correctAnswer) {
      return res.status(400).json({ message: 'Missing required question fields.' });
    }

    // Optional: Verify that the question belongs to a quiz owned by the authenticated teacher
    // This assumes req.teacherId is set by teacherMiddleware
    if (quizId && req.teacherId) {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== req.teacherId) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to edit this question." });
        }
    }
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    // Update fields
    question.questionText = questionText;
    question.type = type;
    question.correctAnswer = correctAnswer;

    if (type === 'mcq') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'MCQ questions must have at least 2 options.' });
      }
      question.options = options;
      // Also ensure correct answer is one of the options for MCQ
      if (!options.includes(correctAnswer)) {
          return res.status(400).json({ message: 'Correct answer must be one of the provided options for MCQ.' });
      }
    } else {
      question.options = []; // Clear options if type is not mcq
    }

    await question.save();

    res.status(200).json({ message: 'Question updated successfully', question });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error while updating question.' });
  }
};
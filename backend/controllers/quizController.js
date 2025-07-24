
import fs from "fs";
import pdfParse from "pdf-parse";
import models from "../db.js";

const Quiz = models.quizModel;
const Question = models.questionModel;


import { generateQuizFromText } from "../utils/gemini.js";


export const createQuiz = async (req, res) => {
  try {
    const { title, topic, numberOfQuestions,duration,scheduleAt } = req.body;
  
    const teacherId = req.teacherId; 

    let content = topic;
    if (req.file && fs.existsSync(req.file.path)) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
      fs.unlinkSync(req.file.path); 
    }

    
    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "No content provided for quiz generation (either topic or PDF)." });
    }
    
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Quiz title is required." });
    }
    
    if (isNaN(numberOfQuestions) || numberOfQuestions <= 0) {
        return res.status(400).json({ error: "Number of questions must be a positive number." });
    }


    // Generate quiz questions using Gemini
    const generatedQuestions = await generateQuizFromText(content, numberOfQuestions);

    // Basic validation for generatedQuestions
    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        console.warn("Gemini generated no questions or an invalid format.");
        return res.status(500).json({ error: "AI failed to generate valid quiz questions. Please try again with different content." });
    }

    // Save quiz to DB
    const newQuiz = new Quiz({
      title,
      topic: topic || "From PDF", 
      createdBy: teacherId,
      duration,
      scheduleAt,
      numberOfQuestions,              
      
    });
    await newQuiz.save();

    
    // array for question id
    const questionIds = [];

    // Save each question separately and collect their IDs
    for (let q of generatedQuestions) {
      const question = new Question({
        quiz: newQuiz._id, // Link to the newly created quiz
        type: q.type, // "mcq" or "one-line"
        questionText: q.question, // Use q.question from Gemini response
        options: q.type === "mcq" ? (q.options || []) : [], // Only include options for MCQs
        correctAnswer: q.correctAnswer,
      });
      await question.save();
      questionIds.push(question._id); // Store the ID
    }

    // Update the quiz with the generated question IDs
    newQuiz.questions = questionIds;
    await newQuiz.save(); // Save the quiz again to update the questions array

    res.status(201).json({ message: "Quiz created successfully", quizId: newQuiz._id });
  } catch (error) {
    console.error("Quiz creation error:", error);
    
    if (error.message.includes("Failed to generate quiz from AI")) {
        res.status(502).json({ error: "AI failed to generate quiz. " + error.message });
    } else if (error.message.includes("validation failed")) { 
        res.status(400).json({ error: "Validation error: " + error.message });
    }
    else {
        res.status(500).json({ error: "Failed to create quiz: " + error.message });
    }
  }
};

//Get all quizzes created by this teacher
export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.teacherId }).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

//Get quiz details by ID (with questions)
export const getQuizById = async (req, res) => {
  try {
    
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.status(200).json({ quiz, questions: quiz.questions });
  } catch (err) {
    console.error("Error fetching quiz by ID:", err);
    res.status(500).json({ error: "Error fetching quiz" });
  }
};

// PATCH /api/v1/teacher/quiz/:id/schedule
export const scheduleQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleAt } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        scheduleAt: new Date(scheduleAt),
        isScheduled: true,
      },
      { new: true }
    );

    if (!updatedQuiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Schedule Quiz Error:", error);
    res.status(500).json({ message: "Failed to schedule quiz" });
  }
};
// PATCH /api/v1/teacher/quiz/:id
export const editQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.isScheduled) {
      return res.status(400).json({ message: "Scheduled quiz cannot be edited" });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Edit Quiz Error:", error);
    res.status(500).json({ message: "Failed to edit quiz" });
  }
};


// DELETE /api/v1/teacher/quiz/:id
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Quiz.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};

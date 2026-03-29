import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models from "../db.js";
const studentModel = models.studentModel;
const quizModel = models.quizModel;
const classModel = models.classModel;
const Question = models.questionModel;
import { generateQuizFromText } from "../utils/gemini.js";
import upload from "../middlewares/multer.js";
const PreviousQuiz = models.previousQuizModel;


import express from "express"
import studentMiddleware from "../middlewares/student.js";
const route = express.Router();

route.post("/signup",async (req,res)=> {
    try{
        const {email,password,firstName,lastName}=req.body;
        const hashedPassword= await bcrypt.hash(password,10);
        const student = await studentModel.create({
            email,
            password:hashedPassword,
            firstName,
            lastName,
        });
        // Optionally, create a JWT token here if you want auto-login after signup
        res.status(201).json({ message: "Student signed up", student });
    }
    catch(e){
        res.status(500).send("Error signing up user: " + e.message);
    }
})
 
route.post('/signin', async (req,res)=> {
    try {
        const {email,password}=req.body;
        const student =await studentModel.findOne({email});
        if(!student){
            return res.status(404).send("Student Not Found");
        }
        const isPasswordCorrect = await bcrypt.compare(password, student.password);
        if(!isPasswordCorrect){
            return res.status(401).send("Incorrect Password");
        }
        const token=jwt.sign(
            {
                studentId:student._id,
            },process.env.JWT_STUDENT_PASSWORD
        );
        res.status(200).json({ message: "Student signed in", token, student });

    } catch (error) {
        res.status(500).send("Error signing in user: " + error.message);
    }
})

route.post("/joinclassroom",studentMiddleware, async (req,res)=>{
    const {classroomCode}=req.body;
    
    const existingClass = await classModel.findOne({ _id:classroomCode})

    if(!existingClass){
        return res.status(404).send("Classroom Not found");
    }

   const student=await existingClass.students.push(req.id);
   if(!student){
        return res.status(404).send("Student not found in classroom");
   }
   await existingClass.save();

    res.status(200).send("Student joined classroom successfully");

   

})
route.post("/quizzes/create",studentMiddleware, upload.single("pdf"), async(req, res) => {
   const { topic } = req.body;
     
       const studentId = req.studentId; 
     const numberOfQuestions=10;
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
       
       if (!topic || topic.trim() === "") {
           return res.status(400).json({ error: "Quiz title is required." });
       }
       
       if (isNaN(numberOfQuestions) || numberOfQuestions <= 0) {
           return res.status(400).json({ error: "Number of questions must be a positive number." });
       }
   
   
       // Generate quiz questions using Gemini
       const generatedQuestions = await generateQuizFromText(content, 10);
   
       // Basic validation for generatedQuestions
       if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
           console.warn("Gemini generated no questions or an invalid format.");
           return res.status(500).json({ error: "AI failed to generate valid quiz questions. Please try again with different content." });
       }
   
       // Save quiz to DB
       const newQuiz = new quizModel({
         title:"Practice Quiz",
         topic: topic, 
         createdBy: studentId,
         duration: 30,
        
         numberOfQuestions:10,              
         
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
     

});

route.post("/quizzes/attempt", studentMiddleware, async (req, res) => {
	try {
		const { quizId } = req.body;

		// Ensure the quiz is assigned to this student's classroom
		const student = await studentModel.findById(req.studentId);
		if (!student || !student.classId) {
			return res.status(403).send("Student not in a classroom");
		}

		const classroom = await classModel.findById(student.classId);
		if (!classroom || !classroom.quizzes?.some((id) => id.toString() === quizId)) {
			return res.status(403).send("Quiz not assigned to your classroom");
		}

		const quiz = await quizModel.findById(quizId);
		if (!quiz) {
			return res.status(404).send("Quiz not found");
		}

		const now = new Date();
		if (!quiz.isScheduled || !quiz.scheduleAt || new Date(quiz.scheduleAt) > now) {
			return res.status(403).send("Quiz is not yet available");
		}

		const Questions = [];
		for (let questionId of quiz.questions) {
			let question = await Question.findById(questionId);
			if (!question) {
				return res.status(404).send(`Question with ID ${questionId} not found`);
			}
			Questions.push({
				_id: question._id,
				questionText: question.questionText,
				type: question.type,
				options: question.options,
			});
		}

		res.status(200).json({ Questions });
	} catch (error) {
		res.status(500).send("Error fetching quiz attempt: " + error.message);
	}
});
route.post("/quizzes/practice/attempt", studentMiddleware, async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // practice quiz should belong to the logged-in student
    if (quiz.createdBy.toString() !== req.studentId) {
      return res.status(403).json({ error: "You can only access your own practice quiz" });
    }

    const Questions = [];

    for (const questionId of quiz.questions) {
      const question = await Question.findById(questionId);

      if (!question) {
        return res.status(404).json({ error: `Question with ID ${questionId} not found` });
      }

      Questions.push({
        _id: question._id,
        questionText: question.questionText,
        type: question.type,
        options: question.options,
      });
    }

    return res.status(200).json({ Questions });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching practice quiz: " + error.message });
  }
});
route.get("/quizzes/previous", studentMiddleware, async (req, res) => {
  try {
    const attempts = await PreviousQuiz.find({ studentId: req.studentId })
      .populate("quizId")
      .sort({ attemptedAt: -1 });

    res.status(200).json(attempts);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});

route.get("/quizzes/available", studentMiddleware, async (req, res) => {
	try {
		// Find the student's classroom and return quizzes assigned to it
		const student = await studentModel.findById(req.studentId);
		if (!student) return res.status(404).send("Student not found");
		if (!student.classId) return res.status(404).send("Student is not in a classroom");

		const classroom = await classModel
			.findById(student.classId)
			.populate({ path: "quizzes", model: "Quiz" });

		if (!classroom || !classroom.quizzes || classroom.quizzes.length === 0) {
			return res.status(404).send("No quizzes available for this classroom");
		}

		const now = new Date();
		const quizzesWithStatus = classroom.quizzes.map((quiz) => {
			let status = "unscheduled";
			if (quiz.isScheduled) {
				if (!quiz.scheduleAt) status = "unscheduled";
				else if (new Date(quiz.scheduleAt) > now) status = "upcoming";
				else status = "available";
			}
			return { ...quiz.toObject(), status };
		});

		res.status(200).json(quizzesWithStatus);
	} catch (error) {
		res.status(500).send("Error fetching quizzes: " + error.message);
	}
});

 

route.post("/quizzes/submit", studentMiddleware, async (req, res) => {
    try {
        console.log("Submitting quiz with body:", req.body);
        const { quizId, responses } = req.body;
        const studentId = req.studentId;

        if (!studentId || !quizId || !responses || typeof responses !== "object") {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const quiz = await quizModel.findById(quizId).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        // Calculate score based on correct answers
        let correctCount = 0;
        const attemptedQuestions = [];

        for (const question of quiz.questions) {
            const answer = responses[question._id];
            const normalizedAnswer = typeof answer === "string" ? answer.trim().toLowerCase() : "";
            const correctNormalized = String(question.correctAnswer).trim().toLowerCase();

            if (normalizedAnswer === correctNormalized) {
                correctCount += 1;
            }

            attemptedQuestions.push({
                questionText: question.questionText,
                type: question.type,
                options: question.options,
                correctAnswer: question.correctAnswer,
            });
        }

        const score = correctCount;

        await PreviousQuiz.create({
            studentId,
            quizId,
            questions: attemptedQuestions,
            responses,
            score,
            attemptedAt: new Date(),
        });

        // Delete quiz from quizModel
        

     

        res.status(200).json({ message: "Quiz submitted", score, total: quiz.questions.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to submit quiz" });
    }
});


route.get("/quizzes/previous", studentMiddleware, async (req, res) => {
  try {
    const attempts = await PreviousQuiz.find({ studentId: req.studentId });
    res.status(200).json(attempts);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});
route.get("/quizzes/practice", studentMiddleware, async (req, res) => {
  try {
    const quizzes = await quizModel
      .find({ createdBy: req.studentId })
      .sort({ createdAt: -1 });

    return res.status(200).json(quizzes);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch practice quizzes" });
  }
});




export default route;
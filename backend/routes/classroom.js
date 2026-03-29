import express from 'express';
import db from "../db.js";
import mongoose from "mongoose";
import studentMiddleware from "../middlewares/student.js";
const { classModel, quizModel, studentModel, teacherModel } = db;
const route = express.Router();

// Create a classroom (teacher only)
route.post("/create", async (req, res) => {
	try {
		const { name, teacherId, code: inputCode } = req.body;
		if (!name || !teacherId) return res.status(400).json({ message: "Name and teacherId required" });

		let code = inputCode && inputCode.trim() ? inputCode.trim().toUpperCase() : null;
		if (code) {
			// If teacher provided a code, check uniqueness
			const existing = await classModel.findOne({ code });
			if (existing) {
				return res.status(400).json({ message: "Classroom code already exists. Please choose another." });
			}
		} else {
			// Auto-generate unique code
			let isUnique = false;
			while (!isUnique) {
				code = Math.random().toString(36).substring(2, 8).toUpperCase();
				const existing = await classModel.findOne({ code });
				if (!existing) isUnique = true;
			}
		}

		const classroom = await classModel.create({ name, teacher: teacherId, code });
		res.status(201).json(classroom);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Join a classroom (student)
route.post("/join", studentMiddleware, async (req, res) => {
	try {
		const { code } = req.body;
		const studentId = req.studentId;

		const classroom = await classModel.findOne({ code });
		if (!classroom) return res.status(404).json({ message: "Classroom not found" });

		// Assign the classroom to the student
		await studentModel.findByIdAndUpdate(studentId, { classId: classroom._id });

		// Keep track of which students are in each classroom
		classroom.students = classroom.students || [];
		if (!classroom.students.some((id) => id.toString() === studentId)) {
			classroom.students.push(studentId);
			await classroom.save();
		}

		res.json({ message: "Joined classroom", classroom });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Assign quiz to classroom (teacher only)
route.post("/assign-quiz", async (req, res) => {
	try {
		const { classroomId, quizId } = req.body;
		const classroom = await classModel.findById(classroomId);
		if (!classroom) return res.status(404).json({ message: "Classroom not found" });

		classroom.quizzes = classroom.quizzes || [];
		if (!classroom.quizzes.some((id) => id.toString() === quizId)) {
			classroom.quizzes.push(quizId);
			await classroom.save();
		}

		res.json({ message: "Quiz assigned", classroom });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// List classrooms for a teacher
route.get("/teacher/:teacherId", async (req, res) => {
	try {
		const classrooms = await classModel.find({ teacher: req.params.teacherId });
		res.json(classrooms);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get the classroom for the authenticated student
route.get("/me", studentMiddleware, async (req, res) => {
	try {
		const student = await studentModel.findById(req.studentId);
		if (!student || !student.classId) return res.status(404).json({ message: "No classroom found" });
		const classroom = await classModel
			.findById(student.classId)
			.populate({ path: "quizzes", model: "Quiz" });
		res.json({ classroom });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get classroom details (with quizzes and students)
route.get("/:id", async (req, res) => {
	try {
		const classroom = await classModel.findById(req.params.id)
			.populate("quizzes")
			.populate({ path: "students", model: "Student" });
		if (!classroom) return res.status(404).json({ message: "Classroom not found" });
		res.json(classroom);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


export default route;


import models from '../db.js';

const Teacher = models.teacherModel; 

export const getTeacherProfile = async (req, res) => {
    try {
        if (!req.teacherId) {
            return res.status(401).json({ message: 'Not authenticated as a teacher.' });
        }

        const teacher = await Teacher.findById(req.teacherId).select('-password'); 
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found.' });
        }

        res.status(200).json(teacher);
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({ message: 'Server error while fetching teacher profile.' });
    }
};
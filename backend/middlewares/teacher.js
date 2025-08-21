import jwt from "jsonwebtoken";

const JWT_TEACHER_PASSWORD = "teacher_password_jwt";

function teacherMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: Token missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_TEACHER_PASSWORD);
    req.teacherId = decodedToken.teacherId; 
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized Teacher: Invalid token");
  }
}

export default teacherMiddleware;

import jwt from "jsonwebtoken";

function teacherMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: Token missing");
  }

  const secret = process.env.JWT_TEACHER_PASSWORD;
  if (!secret) {
    console.error('JWT_TEACHER_PASSWORD env var is not set');
    return res.status(500).send('Server misconfiguration: auth secret missing');
  }

  try {
    const decodedToken = jwt.verify(token, secret);
    req.teacherId = decodedToken.teacherId;
    next();
  } catch (error) {
    console.error('Teacher auth error:', error && error.message ? error.message : error);
    return res.status(401).send("Unauthorized Teacher: Invalid token");
  }
}

export default teacherMiddleware;

import jwt from "jsonwebtoken";
const JWT_STUDENT_PASSWORD = process.env.JWT_STUDENT_PASSWORD || "student_password_jwt";

function studentMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: Token missing");
  }

  try {
    const decodedToken = jwt.verify(token, JWT_STUDENT_PASSWORD);
    req.studentId = decodedToken.studentId;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).send("Unauthorized: Invalid or malformed token");
  }
}

export default studentMiddleware;

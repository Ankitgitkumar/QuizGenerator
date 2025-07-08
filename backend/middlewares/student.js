import jwt from "jsonwebtoken";
const JWT_STUDENT_PASSWORD="student_password_jwt"

function studentMiddleware(req,res,next){

    const token= req.headers.token;

    if (!token) {
        return res.status(401).send("Unauthorized: Token missing");
      }

    const decodedToken=jwt.verify(token,JWT_STUDENT_PASSWORD);

    if(decodedToken){
        req.Id=decodedToken.studentId;
        next();
    }
    else{
        res.status(401).send("Unauthorized student");
    }
}

export default studentMiddleware
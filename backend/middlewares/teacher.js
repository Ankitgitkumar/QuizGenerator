import jwt from "jsonwebtoken";
const JWT_TEACHER_PASSWORD="teacher_password_jwt"

function teacherMiddleware(req,res,next){

    const token= req.headers.token;

    if (!token) {
        return res.status(401).send("Unauthorized: Token missing");
      }

    const decodedToken=jwt.verify(token,JWT_TEACHER_PASSWORD);

    if(decodedToken){
        req.Id=decodedToken.teacherId;
        next();
    }
    else{
        res.status(401).send("Unauthorized Teacher");
    }
}

export default teacherMiddleware
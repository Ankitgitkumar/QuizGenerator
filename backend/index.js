import express from 'express';
import mongoose from 'mongoose';
const app=express();

app.use(express.json()); 




async function  main(){

 await mongoose.connect("mongodb+srv://quizforgeai:aiquizgenerator24@quizai.xhijqdh.mongodb.net/quizforge")
app.listen(3141, () => {
    console.log(`Server running at http://localhost:3141`);
  });
  console.log("Connected to MongoDB");
}

main();
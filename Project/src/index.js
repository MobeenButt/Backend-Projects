// //import dotenv from "dotenv"
// import dotenv from 'dotenv'
// import connectDB from "./db/index.js"
// dotenv.config()
// connectDB()
import mongoose from "mongoose";
import dotenv from "dotenv"
import { DB_NAME } from "./constants.js";
// import connectDB from "./db/index.js"
// dotenv.config();
// connectDB()
dotenv.config();
(async ()=>{
    try {
          const mongoURI=process.env.MONGODB_URI;
          if(!mongoURI)
          {
            throw new Error("MongoDB URI env is not correct");
          }
      const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`MongoDB connected successfully at Host ${connectionInstance.connection.host}`)
    //    app.listen(process.env.PORT,()=>
    // {
    //     console.log(`App is listening to PORT ${process.env.PORT}`);

        
    // })
    } catch (error) {
        console.log("Error: ",error)
        throw error;
    }
})()
    
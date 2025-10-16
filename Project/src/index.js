// import mongoose from "mongoose";
// import dotenv from "dotenv"
// import { DB_NAME } from "./constants.js";

// dotenv.config();
// (async ()=>{
//     try {
//           const mongoURI=process.env.MONGODB_URI;
//           if(!mongoURI)
//           {
//             throw new Error("MongoDB URI env is not correct");
//           }
//       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        console.log(`MongoDB connected successfully at Host ${connectionInstance.connection.host}`)
//     //    app.listen(process.env.PORT,()=>
//     // {
//     //     console.log(`App is listening to PORT ${process.env.PORT}`);

//     // })
//     } catch (error) {
//         console.log("Error: ",error)
//         throw error;
//     }
// })()

import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.on("error",(error)=>
    {
        console.log("Error: ",error)
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo Db connection failed !!", err);
  });

// async code also returns a promise therefore in connectDB it returns a promise also

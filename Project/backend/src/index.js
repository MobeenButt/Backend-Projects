import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const { default: connectDB } = await import("./db/index.js");
const { app } = await import("./app.js");

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo Db connection failed !!", err);
  });

// async code also returns a promise therefore in connectDB it returns a promise also

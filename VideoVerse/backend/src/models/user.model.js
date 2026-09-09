import mongoose, { Schema } from "mongoose";

// JWT (JSON Web Token)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // url
    avatar: {
      type: String, //cloudinary url
      // required: true
      required: false,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [72, "Password must be at most 72 characters"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    // createdAt,updatedAt
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.generateAccessToken=function(){
 return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      username:this.username,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken=function(){
   return jwt.sign(
    {
      _id:this._id
      // email:this.email,
      // username:this.username,
      // fullName:this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


userSchema.methods.isPasswordCorrect=async function(password)
{
    // logic to check password
  return await  bcrypt.compare(password,this.password);
}
export const User = mongoose.model("User", userSchema);

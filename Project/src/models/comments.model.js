import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content:{type:String, required:true},
        createdAt: { type: Date, default: Date.now },
        updatedAt:{type: Date, default: Date.now},
        video:{type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }

    }
)
export const Comment = moongose.model("Comment", commentSchema);
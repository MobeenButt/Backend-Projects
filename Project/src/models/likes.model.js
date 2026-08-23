import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        comment:{type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        createdAt: { type: Date, default: Date.now },
        video:{type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        updatedAt:{type: Date, default: Date.now},
        likedBy:{type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        tweet:{type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet"
        }
    }
)

export const Like = mongoose.model("Like", likeSchema);
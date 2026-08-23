import moongose from "mongoose";

const likeSchema = new moongose.Schema(
    {
        comment:{type:moongose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        createdAt: { type: Date, default: Date.now },
        video:{type:moongose.Schema.Types.ObjectId,
            ref:"Video"
        },
        updatedAt:{type: Date, default: Date.now},
        likedBy:{type:moongose.Schema.Types.ObjectId,
            ref:"User"
        },
        tweet:{type:moongose.Schema.Types.ObjectId,
            ref:"Tweet"
        }
    }
)

export const Like = moongose.model("Like", likeSchema);
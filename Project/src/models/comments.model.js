import moongose from "mongoose";

const commentSchema = new moongose.Schema(
    {
        content:{type:String, required:true},
        createdAt: { type: Date, default: Date.now },
        updatedAt:{type: Date, default: Date.now},
        video:{type:moongose.Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{type:moongose.Schema.Types.ObjectId,
            ref:"User"
        }

    }
)
export const Comment = moongose.model("Comment", commentSchema);
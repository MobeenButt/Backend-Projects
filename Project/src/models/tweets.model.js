import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema(
    {
        owner:{type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:{type:String, required:true},
        createdAt: { type: Date, default: Date.now },
        updatedAt:{type: Date, default: Date.now},
    })

export const Tweet = mongoose.model("Tweet", tweetSchema);
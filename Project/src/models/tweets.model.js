import moongoose from 'mongoose';

const tweetSchema = new moongoose.Schema(
    {
        owner:{type:moongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:{type:String, required:true},
        createdAt: { type: Date, default: Date.now },
        updatedAt:{type: Date, default: Date.now},
    })

export const Tweet = moongoose.model("Tweet", tweetSchema);
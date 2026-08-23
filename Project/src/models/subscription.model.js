import moongoose from 'mongoose';

const subscriptionSchema = new moongoose.Schema({
    subscriber:{type:moongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{type:moongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt:{type: Date, default: Date.now},
})

export const Subscription = moongoose.model("Subscription", subscriptionSchema);
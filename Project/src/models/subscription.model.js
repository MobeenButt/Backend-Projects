import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subscriber:{type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt:{type: Date, default: Date.now},
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
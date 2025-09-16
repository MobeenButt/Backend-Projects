import mongoose from 'mongoose'

const categorySchema=new mongoose.Schmea({
    name:
    {
        type:String,
        required:true
    }
},
{timestamps:true})


export const Category=mongoose.model("Category",categorySchema)

// stored in Database as categories
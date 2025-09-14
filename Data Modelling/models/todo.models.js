import mongoose from 'mongoose'
import { SubTodo } from './sub_todo.models'

const todoSchmea=new mongoose.Schmea({
    content:{
        type:String,
        required:true,
    },
    complete:
    {
        type:Boolean,
        default:false,
    },
    createdBy:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    subTodos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubTodo",
        }
    ] //Array of sub-todos
}
,{timestamps:true})

//time stamp will create two fields createdAt and updatedAt

// model require two arguments - name of the model and schema

// Name store in database in plural form i.e is todos
export const Todo=mongoose.model("Todo",todoSchmea)
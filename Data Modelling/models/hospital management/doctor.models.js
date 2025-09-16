import mongoose from 'mongoose'

// const hospitalHours=new mongoose.Schema({
//     totalHours:
//     {
//         type:Number,
//         default:0
//     }
// })

const doctorSchema=new mongoose.Schema({
    name:
    {
        type:String,
        required:true
    },
    salary:
    {
        type:String,
        required:true
    },
    qualification:
    {
        type:String,
        required:true
    },
    experienceInYears:
    {
        type:Number,
        default:0
    },
    worksInHospitals:
    [
        {
            type:mongoose.Schema.Types.ObjecId,
            ref:"Hosiptal"
        },
    ]
},
{timestamps:true})

export const Doctor=mongoose.model('Doctor',doctorSchema)
import multer from "multer";


const storage=multer.diskStorage(
    {
        // File kahan save ho
        destination:function(req,file,db)
        {
            cb(null,'/public/temp')
        },

        // File ka naam kia ho
        filename:function(req,file,cb)
        {
            cb(null,file.originalname)
        }
    }
)

export const upload =multer({
    // storage:storage
    storage,
})
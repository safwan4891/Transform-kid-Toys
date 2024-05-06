const multer=require("multer")
const path=require("path")


const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  let dest=path.join(__dirname,"../public/images")
 cb(null,dest)

 },

 filename:(req,file,cb)=>{
     const uniquename=`${Date.now()}-${file.originalname}`
     cb(null,uniquename)

 }

})

const upload = multer({storage:storage})

module.exports = upload
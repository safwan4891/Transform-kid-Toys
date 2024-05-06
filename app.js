const express = require('express')
const path=require('path')
const app = express()
const nocache = require("nocache")
const userauthRouter = require("./Routes/userauthRouter");
const adminRouter = require("./Routes/adminRouter");
const session = require("express-session");
require('dotenv').config()
//connectDB();

//public dont need to repeat
app.use(express.static("public")); 
app.use(express.static("views"));

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
})

mongoose.connection.on("error", (err) => {
  console.log("Error connecting to MongoDB");
})

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
})


const PORT=4000;



app.use(express.urlencoded({extended:true}))
 app.use("/public",express.static(path.join(__dirname,"/public")))
 app.set('views', path.join(__dirname, 'views'));
app.use(express.json())
app.set('view engine', 'ejs');


app.use(
    session({
      secret: "1231fdsdfssg33435",
      resave: false,
      saveUninitialized: false,
    })
  );
  
  app.use(nocache());

app.use("/", userauthRouter);
app.use("/admin", adminRouter);





app.listen(4000, () => {
    console.log("server is running on http://localhost:4000");
    console.log("server is running on http://localhost:4000/admin/home");

    
})
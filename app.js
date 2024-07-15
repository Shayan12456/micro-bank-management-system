const express = require("express");
const app = express();
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const mongoose = require("mongoose");
const User = require("./models/user.js");

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
  await mongoose.connect("mongodb+srv://shayandeveloper12:sa4ZQfpXJuf2WILn@micro-ban-management-sy.xs5pqg3.mongodb.net/?retryWrites=true&w=majority&appName=micro-ban-management-system");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/Home", (req, res)=>{
    res.render("Home.ejs");
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shayandanishuni@gmail.com',
    pass: 'mxwrdbgjhgrnakxs'
  }
});
let match = [];
let tempUser;
app.post("/Register", async (req, res) => {
    const { name, email, password, country, number, alim } = req.body;

    // Generate a 6-digit OTP without uppercase letters or special characters
    const otpCode = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false
    });
 
    var mailOptions = {
        from: 'shayandanishuni@gmail.com',
        to: email,
        subject: 'OTP PIN CODE',
        text: `Your OTP is ${otpCode}`
      };  

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      tempUser = new User({name, email, password, country, number, alim});
      

    match.push(otpCode);
    res.render("OTP.ejs");
});

app.post("/OTP", async (req, res) => {
    let {otp} = req.body;
    console.log(otp);
    console.log(match[0]);
    if(otp == match[0]){
      await tempUser.save();
      res.redirect("/deposit");
    }else{
      res.render("OTP2.ejs");      
    }
});

app.get("/login", (req, res)=>{
  res.render("login.ejs");
});

app.post("/login", async (req, res)=>{
  let {name, email, password} = req.body;
  let result = await User.find({name, email, password});
  if(result.length!=0){
    res.redirect("/deposit");
  }else{
    res.render("login2.ejs");
  }
});

app.get("/deposit", (req, res)=>{
  res.render("deposit.ejs");
});

app.post("/deposit", (req, res)=>{
  let result = await User.find({name, email, password});
  result[0].
});

app.get("*", (req, res)=>{
    res.render("Home.ejs");
});

app.listen(3000, ()=>{
    console.log("app is listening on port 3000");
});
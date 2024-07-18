const express = require("express");
const app = express();
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const mongoose = require("mongoose");
const User = require("./models/user.js");
const session = require('express-session');

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

app.use(session({
  secret: 'your secret', // Replace with your secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
}}));

function isLoggedIn(req, res, next) {
  if (req.session.user) {
        return next();
  } else {
      res.redirect(`/login?url=${(req.originalUrl!="/success-deposit" && req.originalUrl!="/success-withdraw" )?req.originalUrl:"/deposit"}`);
  }
}

app.get("/Home", (req, res)=>{
  if(req.session.user){
      res.render("home-login.ejs");
  }else{
      res.render("Home.ejs", { msg: req.query.msg });
  }
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
    const { name, email, password, country, number, alim, amount } = req.body;
    let result = await User.findOne({email});
    if(result != null){
      return res.redirect(`/Home?msg=Please enter another email, that user already exists`);
    }else{
      // Generate a 6-digit OTP without uppercase letters or special characters
      if(amount>alim){
        res.redirect(`/Home?msg=Enter amount below account limit please`);
      }else{
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

        tempUser = new User({name, email, password, country, number, alim, amount});

        match.push(otpCode);
        res.redirect("/OTP");
      }
      }
});

app.get("/OTP", async (req, res) => {
  res.render("OTP.ejs");
});

app.post("/OTP", async (req, res) => {
    let {otp} = req.body;
    console.log(otp);
    console.log(match[0]);
    if(otp == match[0]){
      let email = tempUser.email;
      await tempUser.save();
      res.redirect(`/deposit?email=${email}`);
    }else{
      res.render("OTP2.ejs");      
    }
});

app.get("/login", (req, res)=>{
  let {url="/deposit"} = req.query;
  res.render("login.ejs", {url});
});

app.post("/login", async (req, res)=>{
  let {url} = req.query;
  let {name, email, password} = req.body;
  let result = await User.find({name, email, password});
  if(result.length!=0){
    req.session.user = result[0];
    res.redirect(url);
  }else{
    res.render("login2.ejs", {url});
  }
});

app.get("/deposit", isLoggedIn, async (req, res)=>{
  // let {email} = req.query;
  // let result = await User.findOne({email});
  res.render("deposit.ejs");
});


app.post("/deposit", async (req, res)=>{
  try{
    let {amount2} = req.body;
    let email = req.session.user.email;

    const amountAsNumber = parseFloat(amount2);

    let result = await User.findOne({email});
    testAmount=result.amount + amountAsNumber;

    if(testAmount<result.alim){
      result.amount=result.amount + amountAsNumber;
      await result.save();
      // result.amount=result.amount + amountAsNumber; wrong approach as objectg are edited as ref type
      res.redirect("/success-deposit");
    }else{
      let due = result.alim-result.amount;
      res.render("deposit2.ejs", {due});
    }
  }catch(e){
    res.redirect("/login");
  }
});

app.get("/success-deposit",isLoggedIn,(req, res)=>{
  res.render("success-deposit.ejs");
});

app.get("/withdraw", isLoggedIn, async (req, res)=>{
  let email = req.session.user.email;


  res.render("withdraw.ejs", {email});
});

app.post("/withdraw", async (req, res)=>{
  let {amount2} = req.body;
  let email = req.session.user.email;

  const amountAsNumber = parseFloat(amount2);

  let result = await User.findOne({email});
  testAmount=result.amount - amountAsNumber;

  if(testAmount>=0){
    result.amount=result.amount - amountAsNumber;
    await result.save();
    // result.amount=result.amount - amountAsNumber; wrong approach as objectg are edited as ref type
    res.redirect("/success-withdraw");
  }else{
    let left = result.amount;
    res.render("withdraw2.ejs", {left});
  }
});

app.get("/success-withdraw", (req, res)=>{
  res.render("success-withdraw.ejs");
});

app.get("/account-status", isLoggedIn, async (req, res)=>{
  let email = req.session.user.email;
  let result = await User.findOne({email});

  res.render("account-status.ejs", {result});
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Logout failed');
      }
      res.redirect('/login'); // Redirect to login page after logout
  });
});

app.all("*",(req, res)=>{
  res.redirect("/Home");
});

app.listen(3000, ()=>{
    console.log("app is listening on port 3000");
});
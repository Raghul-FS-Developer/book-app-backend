var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
require("dotenv").config();
var user = require("../models/user");
var nodemailer = require("nodemailer");
var book = require("../models/book");

mongoose
  .connect(process.env.URL)
  .then(() => console.log("db connected successfully"));

const { hashing, hashCompare, createjwt, auth ,resetauth ,resetjwt } = require("../library/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", async (req, res) => {
  try {
    let result = await user.findOne({ username: req.body.username });
    if (result) {
      res.json({ message: "Username Already Exist" });
    } else {
      const hash = await hashing(req.body.password);
      req.body.password = hash;
      let token = await createjwt({ username: req.body.username });
      const register = await user(req.body);
      let step2 = await user.findOne({ email: req.body.email });
      if (step2) {
        res.json({ message: "Email Already Exist" });
      } else {
        register.save((err, data) => {
          if (err) {
            console.log(err);
            res.json({ statuscode: 400, message: "Email Already Exist" });
          } else {
            
            let { username } = data;

            var sender = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "stackdeveloper112@gmail.com",
                pass: process.env.pass,
              },
            });
            var composeMail = {
              from: "stackdeveloper112@gmail.com",
              to: req.body.email,
              subject: `Account-verification`,
              text: "",
              html: `<h2>Hello ${username}</h2>
        <p>We've recieved a request to verify your account associated with your email.
        You can register your account by clicking the link below</p>
        <a href=https://library-app-two-xi.vercel.app/register-confirm/${token}>Register verification</a>
        <p><b>Note:</b>The link expires 5 minutes from now</p>
        </div>`,
            };

            sender.sendMail(composeMail, (error) => {
              if (error) {
                console.log(error);
              }res.json({
                statuscode: 200,
              });
            });
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "something went wrong" });
  }
});

router.post("/confirm/:token", async (req, res) => {
  try {
    let mail = await auth(req.params.token);

    if (mail) {
      await user.updateOne(
        { username: mail },
        { $set: { validityStatus: "Active" } }
      );
      res.json({
        statuscode: 200,
      });
    } else {
      res.json({ statuscode: 400, message: "Token Expired" });
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/login", async (req, res) => {
  try {
    const login = await user.findOne({ username: req.body.username });
    let token1 = await createjwt({ username: req.body.username });
    if (login) {
      if (login.validityStatus == "Active") {
        const compare = await hashCompare(req.body.password, login.password);

        if (compare) {
          res.json({
            statuscode: 200,
            messsage: "Login successfully",
            username: req.body.username,
          });
        } else {
          res.json({
            message: "wrong password",
          });
        }
      } else {
        
        let { username } = login;

        var sender = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "stackdeveloper112@gmail.com",
            pass: process.env.pass,
          },
        });
        var composeMail = {
          from: "stackdeveloper112@gmail.com",
          to: login.email,
          subject: `Account-verification`,
          text: "",
          html: `<h2>Hello ${username}</h2>
        <p>We've recieved a request to verify your account associated with your email.
        You can register your account by clicking the link below</p>
        <a href=https://library-app-two-xi.vercel.app/register-confirm/${token1}>Register verification</a>
        <p><b>Note:</b>The link expires 5 minutes from now</p>
        </div>`,
        };

        sender.sendMail(composeMail, (error) => {
          if (error) {
            console.log(error);
          }else{
            res.json({
              message: "Account is InActive , Check Your Mail For Activaton Link",
            });
          }
        });
      }
    } else {
      res.json({
        message: "user does not exist",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//book Routes
router.post("/addbook", async (req, res) => {
  try {
    const books = await book(req.body);
    books.save((err, data) => {
      if (err) {
        console.log(err);
        res.json({ statuscode: 400, message: "book creation failed" });
      } else {
        res.json({ statuscode: 200 });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getbooks", async (req, res) => {
  try {
    let book1 = await book.find();
    res.json(book1);
  } catch (error) {
    console.log(error);
  }
});

router.put("/updatebook/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    let result = await book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (result) {
      res.json({ data: result, statuscode: 200 });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/deletebook/:id", async (req, res) => {
  try {
    let result = await book.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({
        statuscode: 200,
      });
    } else {
      res.json({
        statuscode: 400,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/mybooks", async (req, res) => {
  try {
    let result = await book.find({ createdBy: req.body.user });

    if (result) {
      res.json({ statuscode: 200, data: result });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/editbooks/:id", async (req, res) => {
  try {
    let result = await book.findById(req.params.id);

    if (result) {
      res.json({ statuscode: 200, data: result });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/history", async (req, res) => {
  try {
    let result = await book.find({ category: "history" });

    if (result) {
      res.json({ statuscode: 200, data: result });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/politics", async (req, res) => {
  try {
    let result = await book.find({ category: "politics" });

    if (result) {
      res.json({ statuscode: 200, data: result });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/comics", async (req, res) => {
  try {
    let result = await book.find({ category: "comics" });

    if (result) {
      res.json({ statuscode: 200, data: result });
    } else {
      res.json({ statuscode: 400 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.delete("/deleteuser/:username", async (req, res) => {
  try {
    let result = await user.deleteOne({ username: req.params.username });
    if (result) {
      res.json({
        statuscode: 200,
      });
    } else {
      res.json({
        statuscode: 400,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/getuser/:user", async (req, res) => {
  try {
    
    let result = await user.findOne({username:req.params.user})
    res.json({
      statuscode:200,
      data:result
    })
  } catch (error) {
    console.log(error)
  }


});
router.put("/updateuser/:user",async(req,res)=>{
  try{  
    let result = await user.findOneAndUpdate({username:req.params.user},req.body)
    if(result){
      res.json({statuscode:200})
    }
  }catch(error){
    console.log(error)
    res.json({
      statuscode:400,
      message:'Email Already Exist'
    })
  }
})
router.get('/alluser',async(req,res)=>{
  try {
    let result = await user.find()
    res.json({
      statuscode:200,
      data:result
    })
  } catch (error) {
    console.log(error)
  }
})
router.get('/findbook/:title',async(req,res)=>{
  try {
    console.log(req.params.title)
    let result = await book.find({title:req.params.title})
    if(result){
      res.json({
        statuscode:200,
        data:result
      })
    }else{
      res.json({
      statuscode:400,
      
    })
    }
  } catch (error) {
    console.log(error)
  }
})

router.post("/forgot-password", async (req, res) => {
  try {
   
    let step = await user.findOne({ email: req.body.email });
    
    if (step) {
      const { username } = step;
      let token = await resetjwt({ email: req.body.email });
     
      var sender = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "stackdeveloper112@gmail.com",
          pass: process.env.pass,
        },
      });
      var composeMail = {
        from: "stackdeveloper112@gmail.com",
        to: req.body.email,
        subject: `Reset-password-verification`,
        text: "",
        html: `<h2>Hello ${username}</h2>
      <p>We've recieved a request to reset the password for your account associated with your email.
      You can reset your password by clicking the link below</p>
      <a href=https://library-app-two-xi.vercel.app/confirm/${token}> Reset Password</a>
      <p><b>Note:</b>The link expires 5 minutes from now</p>
      </div>`,
      };

      sender.sendMail(composeMail, (error) => {
        if (error) {
          console.log(error);
        }else{
          res.json({ statuscode: 200});
        } 
      });

     
    
    } else {
      res.json({ statuscode: 400, message: "Email does not exist" });
    }
  } catch (error) {
    console.log(error);
    
  }
});
router.post("/verify/:token", async (req, res) => {
  try {
    let mail = await resetauth(req.params.token);
    
    if (mail) {
       let pass = await hashing(req.body.password);
      await user.updateOne({ email: mail }, { $set: { password: pass } });
      
      res.json({
        statuscode: 200,
        message: "password changed successfullly",
      });
    } else {
      res.json({
        message: "token expired",
      });
    }
  } catch (error) {
    console.log(error);
    
  }
});
module.exports = router;

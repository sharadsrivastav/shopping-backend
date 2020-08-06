const User = require("../models/user");
const { check, validationResult } = require('express-validator');
const user = require("../models/user");
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');



exports.signup = (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            error : errors.array()[0].msg
        });
    }

    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: 'Not able to save the user'
            })
        }
        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        });
    });
};

exports.signin = (req, res) => {
    const errors = validationResult(req);
    const {email, password} = req.body;

    if(!errors.isEmpty()){
        return res.status(422).json({
            error : errors.array()[0].msg
        });
    }

    User.findOne({email} , (err, user) =>{
        if(err || !user ) {
            return res.status(400).json({
                error: "User email does not exist"
            });
        }
        if(!user.authenticate(password)){
            return res.status(401).json({
                error: "Email and password not matched"
            });
        }
        const token = jwt.sign({_id: user._id}, process.env.SECRET)
        res.cookie("token", token, {expire: new Date()+ 9999});

        //response to front end
        const {_id, email , name, role} = user;
        return res.json({token, user:{_id,email,name, role}});
    });
};


exports.signout = (req, res) => {
  res.clearCookie("token");  
  res.json({
    message: "User signout successful"
  });
};

exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
});

// custom middleware

exports.isAuthenticated = (req,res,next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id
    if(!checker){
        return res.status(403).json({
            error : "ACCESS DENIED"
        });
    }
    next();
};

exports.isAdmin = (req,res,next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "You are not an admin, Access Denied"
        });
    }
    next();
};

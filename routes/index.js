//The Auth Routes
//==================================
const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user"); 


router.get("/",(req,res) => res.render("landing"));    
//==========================
//===============
//AUTH Routes

//show register form
router.get('/register', (req,res) => {
    res.render('register', {page: 'register'}); 
}); 

//handle sign up logic
router.post('/register', (req,res) => {
    const newUser = new User({username: req.body.username}); 
    if (req.body.adminCode === 'secret123') { //this is going to be the admin secret code. 
        newUser.adminCode = true; 
    }
    User.register(newUser, req.body.password, (err,user) => {
        if(err) {
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate('local')(req,res, () => {
            req.flash("success", "Welcome to YelpCamp " + user.username); 
            res.redirect('/campgrounds'); 
        });
    });
});

//=============
//create Login ROUTE 

router.get('/login', (req,res) => {
    res.render('login', {page: 'login'}); 
}); 

router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), (req,res) => {
    
}); 
//logout route
router.get('/logout', (req,res) => {
    req.logout(); 
    req.flash("success", "Logged you out!"); 
    res.redirect('/campgrounds'); 
}); 



module.exports = router; 
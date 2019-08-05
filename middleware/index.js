const Campground = require("../models/campground.js"),
      Comment = require("../models/comment.js");



const middlewareObj = {}; 

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
     if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                req.flash("error", "Campground not found"); 
                res.redirect("back");
            } else {
                //check if the user owns the campground 
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next(); 
                } else {
                    req.flash("error", "You dont have permission to do that"); 
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that"); 
        res.redirect("back"); 
    }
}; 

middlewareObj.checkCommentOwnership = function(req, res, next) {
     if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            } else {
                //check if the user owns the campground 
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next(); 
                } else {
                    req.flash("error", "You need to be logged in to do that"); 
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that"); 
        res.redirect("back"); 
    }
};

middlewareObj.isLoggedIn = function(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that"); 
    res.redirect('/login');
};


module.exports = middlewareObj;


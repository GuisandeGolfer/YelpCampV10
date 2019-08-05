const express = require("express"),
    router = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    middleware = require("../middleware"),
    Comment = require("../models/comment"); 

router.get("/new", middleware.isLoggedIn, (req, res) => {
    //find campground by id 
    Campground.findById(req.params.id, (err,campground) => err ? console.log(err) : res.render("comments/new", {Campground: campground}));
    //send the campground object to the comments/new. ejs file for rendering 
});
//=================================
//POST ROUTE FOR NEW COMMENT FORM
router.post("/", middleware.isLoggedIn, (req,res) => {
    //look up campground by ID
    Campground.findById(req.params.id, (err, campground) => {
       if(err){
           console.log(err); 
           res.redirect("/campgrounds"); 
       } else {
    //create new comment 
        Comment.create(req.body.comment, (err,comment) => {
           if(err){
               req.flash("error", "Something went wrong"); 
               console.log(err); 
           } else {
               //add username and id to comment
               comment.author.id = req.user._id; 
               comment.author.username = req.user.username; 
               comment.save(); 
               //save comment
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Successfully added comment"); 
               res.redirect("/campgrounds/" + campground._id); 
           } 
        });
    //connect new comment to the campground in the database 
    //redirect to campgroud show page 
       }
    });
});

//EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req,res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => { 
        if (err) {
            res.redirect("back"); 
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
}); 

//COMMENT UPDATE
router.put("/:comment_id", (req, res) => {
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err) {
            res.redirect("back"); 
        } else {
            res.redirect("/campgrounds/" + req.params.id); 
        }
     }); 
});

//DESTROY ROUTE
router.delete("/:comment_id", function(req,res) {
    //find by ID and remove 
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted"); 
            res.redirect("/campgrounds/" + req.params.id); 
        }
    });
    
}); 


module.exports = router; 
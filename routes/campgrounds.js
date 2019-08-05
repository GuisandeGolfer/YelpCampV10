const express = require("express"),
    router = express.Router(),
    middleware = require("../middleware"),
    NodeGeocoder = require("node-geocoder"), 
    Campground = require("../models/campground");
    
let options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}; 

const geocoder = NodeGeocoder(options); 

router.get("/", (req,res) => {  //creates path for campgrounds
    //get all campgrounds from DB   //most things will have a call back function
    Campground.find({}, (err,allCampgrounds) => err ? console.log(err) : res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'}));
});

router.post("/", middleware.isLoggedIn, (req, res) => { 
    //get data from form and add to camp array
    let name = req.body.name; //selects the name
    let price = req.body.price; 
    let image = req.body.image;
    let description = req.body.description; 
    let author = {
        id: req.user._id, 
        username: req.user.username
    };     //and image
    geocoder.geocode(req.body.location, function(err, data) {
        console.log(err);
        if (err || !data.length) {
            console.table(req.body.location, "post /");
            req.flash('error', "Invalid address");
            return res.redirect('back');
        }
        let lat = data[0].latitude;
        let lng = data[0].longitude; 
        let location = data[0].formattedAddress; 
        
        let newCampground = {name:name,price: price,image:image,description: description, author: author, location: location, lat: lat, lng: lng}; //just like on line 19
        //console.log(req.user); 
        //create a new campground and save to DB
        Campground.create(newCampground, (err,newlyCreated) => {
            if (err) { 
                console.log(err); 
            } else { 
                console.log(newlyCreated); 
                res.redirect("/campgrounds"); 
            }
        });   
    });
});


//NEW - SHOW FORM TO CREATE NEW CAMPGROUND 
router.get("/new", middleware.isLoggedIn,(req, res) => {
    res.render("campgrounds/new"); 
    
});
//===============================
//SHOW - SHOWS MORE INFO ABOUT A PARTICULAR CAMPSITE 
router.get("/:id", (req, res) => {
    //find campground with provided ID. 
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        err ? console.log(err) : res.render("campgrounds/show", {theCampground: foundCampground}); 
    });
    //render show template with that campground. 
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req,res) => {
    //check if user is logged in
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground});
});
});
//UPDATE CAMPGROUND ROUTE 
router.put("/:id", middleware.checkCampgroundOwnership, (req,res) => {
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      console.log(err); 
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
        });
    });
});

//DESTROY CAMPGROUND ROUTE 
router.delete("/:id", middleware.checkCampgroundOwnership, (req,res) => {
    Campground.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            res.redirect("/campgrounds"); 
        } else {
            res.redirect("/campgrounds"); 
        }
    });
});




module.exports = router; 
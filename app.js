const express     =     require("express"),
    app         =       express(),
    flash       =       require("connect-flash"),
    bodyParser  =       require("body-parser"),
    mongoose    =       require("mongoose"),
    Campground  =       require("./models/campground.js"),
    User        =       require("./models/user.js"),
    Comment     =       require("./models/comment.js"),
    passport    =       require("passport"),
    LocalStrategy =     require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"), 
    //seedDB    =         require("./seeds"),
    commentRoutes = require("./routes/comments"), 
    campgroundRoutes = require("./routes/campgrounds"),
    methodOverride  =   require("method-override"),
    dotenv          =   require("dotenv"),
    indexRoutes      =  require("./routes/index"); 

dotenv.config(); 
 
mongoose.connect('mongodb+srv://devdiego:' + process.env.MONGO_KEY + '@yelpcdb-fly1m.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true, 
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB');
}).catch(err => {
    console.log('Error:', err.message); 
}); 
    
    
//mongoose.connect("mongodb://localhost/yelp_camp_v2_10",{ useNewUrlParser: true }); //connects to the *running mongo server in the other terminal window 
app.use(bodyParser.urlencoded({extended: true})); /*     Enables the use of
                                                        'body-parser' dependencies*/
app.set("view engine", "ejs"); //makes the end '.ejs' inherent in render files. 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); 
app.use(flash()); 
//seed the database 
//seedDB(); 

//passport config
app.use(require("express-session")({
    secret: 'Once again Rusty wins cutest dog!',
    resave: false, 
    saveUninitialized: false
}));

app.locals.moment = require("moment"); 

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); //There must be another auth-lib to fix this process. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req,res,next) => {
    res.locals.currentUser = req.user; 
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success"); 
    next(); 
}); 

//REQUIRING ROUTES FROM ROUTES DIRECTORY ========== 
app.use(indexRoutes);
app.use('/campgrounds/:id/comments',commentRoutes); //adds a default prefix to all routes
app.use('/campgrounds', campgroundRoutes);


//============================================================
app.listen(process.env.PORT, process.env.IP, () =>  console.log("YelpCamp is listening"));
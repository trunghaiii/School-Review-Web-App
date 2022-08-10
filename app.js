if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
// console.log(process.env.CLOUDINARY_NAME);
// console.log(process.env.CLOUDINARY_API_KEY);
// console.log(process.env.CLOUDINARY_API_SECRET);

const express = require('express')
const mongoose = require("mongoose")
const ExpressError = require("./utils/ExpressError")
const Joi = require('joi');
const methodOverride = require('method-override')
const session = require('express-session')
var flash = require('connect-flash')
const engine = require('ejs-mate')
const passport = require("passport")
const localStrategy = require("passport-local")
const User = require("./models/users")

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/schoolDB';
// 'mongodb://localhost:27017/schoolDB'

const userRouter = require("./routes/users");
const schoolRouter = require("./routes/schools");
const reviewRouter = require("./routes/reviews");

const MongoDBStore = require('connect-mongo')(session);

const app = express()

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.engine('ejs', engine);

app.use(express.static(__dirname + '/public'));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 
})

store.on("error", function(e){
    console.log("Session Store Error", e);
})

const sessionConfig = {
    store,
    secret: 'thissecretshouldbebetter',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
     }
  }
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.successStatement = req.flash('success');
    res.locals.errorStatement = req.flash('error');

    next();
})

app.use("/", userRouter);
app.use('/schools', schoolRouter);
app.use('/schools', reviewRouter);

app.get("/", (req, res) => {
    res.render("home");
})

// app.get("/fakeUser", async (req,res) =>{
//     let user = new User({email: "hai@gmail.com", username: "hai"});
//     let registeredUser = await User.register(user, "hai");
//     res.send(registeredUser);
// })

app.all("*", (req,res,next)=>{
    throw new ExpressError("Page Not Found", 404);
})
app.use((err, req, res, next) => {

    const {message = "Something went wrong",statusCode = 500} = err;
    res.status(statusCode).render("error", {err});
    // res.send("Oh Boy, something went wrong");
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`This app is running on port ${port}`)
})
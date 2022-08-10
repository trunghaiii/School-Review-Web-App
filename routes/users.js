const express = require('express')
const router = express.Router()
const User = require("../models/users")
const { catchAsync } = require("../utils/catchAsync")
const passport = require("passport")
let temp;



router.get("/register", (req, res) => {
    res.render("users/register");
})

router.post("/register", catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) { return next(err); }
            req.flash("success", "Welcome!!!");
            res.redirect("/schools");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}))

router.get("/login", (req, res) => {
    temp = req.session.returnTo || "/schools";
    if(temp.includes("/review")){
        temp = "/schools";
    }
    delete req.session.returnTo;
    // console.log(req.session);
    // console.log(temp);
    res.render("users/login")
})

 

router.post("/login", passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), function (req, res) {

    
    req.flash("success", "Welcome Back!!!");
    console.log(temp)
    res.redirect(temp);
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "Goodbye!!!");
        res.redirect("/login");
    });

})


module.exports = router;